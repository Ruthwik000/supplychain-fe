import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const geocodeCache = new Map()

function normalizeKey(text) {
  return String(text || '').trim().toLowerCase()
}

async function geocodeLocation(location) {
  const normalized = normalizeKey(location)
  if (!normalized) {
    return null
  }
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)
  }

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Geocode HTTP ${response.status}`)
    }

    const payload = await response.json()
    if (!Array.isArray(payload) || !payload.length) {
      return null
    }

    const first = payload[0]
    const lat = Number(first.lat)
    const lon = Number(first.lon)
    const value = Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null
    if (!value) {
      return null
    }
    geocodeCache.set(normalized, value)
    return value
  } catch {
    return null
  }
}

function routeColor(status) {
  if (status === 'selected') return '#22c55e'
  if (status === 'disqualified') return '#ef4444'
  return '#3b82f6'
}

function withCurvature(points, routeIndex, routeCount) {
  if (!Array.isArray(points) || points.length !== 2 || routeCount <= 1) {
    return points
  }

  const [start, end] = points
  const offsetIndex = routeIndex - (routeCount - 1) / 2
  if (Math.abs(offsetIndex) < 0.001) {
    return points
  }

  const dx = end[1] - start[1]
  const dy = end[0] - start[0]
  const length = Math.sqrt(dx * dx + dy * dy) || 1
  const unitPerpLat = -dx / length
  const unitPerpLon = dy / length
  const offsetMagnitude = 0.9 * offsetIndex

  const mid = [
    (start[0] + end[0]) / 2 + unitPerpLat * offsetMagnitude,
    (start[1] + end[1]) / 2 + unitPerpLon * offsetMagnitude,
  ]
  return [start, mid, end]
}

function FitBounds({ bounds }) {
  const map = useMap()

  useEffect(() => {
    if (!bounds.length) {
      return
    }
    map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 0.6 })
  }, [map, bounds])

  return null
}

export default function LiveRouteMap({ routes, activeRouteId }) {
  const [resolvedRoutes, setResolvedRoutes] = useState([])
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')

  useEffect(() => {
    let canceled = false

    const resolve = async () => {
      if (!Array.isArray(routes) || !routes.length) {
        setResolvedRoutes([])
        return
      }

      setIsResolving(true)
      setResolveError('')

      try {
        const unresolvedRoutes = routes.filter((route) => {
          const coords = Array.isArray(route.coordinates) ? route.coordinates : []
          return coords.length < 2
        })
        const uniqueLocations = [...new Set(unresolvedRoutes.flatMap((route) => route.locations || []))]
        const mapping = new Map()

        for (const location of uniqueLocations) {
          // Sequential resolution keeps free geocoder usage conservative.
          const coords = await geocodeLocation(location)
          if (coords) {
            mapping.set(location, coords)
          }
        }

        if (canceled) return

        const next = routes.map((route, index) => {
          const backendCoords = (route.coordinates || [])
            .filter((coords) => Array.isArray(coords) && coords.length === 2)
          if (backendCoords.length >= 2) {
            return {
              ...route,
              coordinates: backendCoords,
            }
          }

          const resolvedFromNames = (route.locations || [])
            .map((location) => mapping.get(location) || null)
            .filter((coords) => Array.isArray(coords) && coords.length === 2)
          const displayCoords = withCurvature(resolvedFromNames, index, routes.length)

          return {
            ...route,
            coordinates: displayCoords,
          }
        })

        const visibleCount = next.filter((route) => route.coordinates.length >= 2).length
        if (!visibleCount) {
          setResolveError('Unable to resolve map coordinates for the current route names.')
        }

        setResolvedRoutes(next)
      } catch {
        if (!canceled) {
          setResolveError('Failed to resolve route coordinates for map rendering.')
        }
      } finally {
        if (!canceled) {
          setIsResolving(false)
        }
      }
    }

    resolve()

    return () => {
      canceled = true
    }
  }, [routes])

  const bounds = useMemo(() => {
    return resolvedRoutes.flatMap((route) => route.coordinates || [])
  }, [resolvedRoutes])

  const center = useMemo(() => {
    if (!bounds.length) return [20, 78]
    const lat = bounds.reduce((sum, point) => sum + point[0], 0) / bounds.length
    const lon = bounds.reduce((sum, point) => sum + point[1], 0) / bounds.length
    return [lat, lon]
  }, [bounds])

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    })
  }, [])

  const selectedRoute = resolvedRoutes.find((route) => route.id === activeRouteId)

  return (
    <div className="live-route-map">
      <MapContainer center={center} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {resolvedRoutes.map((route) => {
          if (!route.coordinates || route.coordinates.length < 2) {
            return null
          }
          return (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{
                color: routeColor(route.status),
                weight: route.id === activeRouteId ? 5 : 3,
                opacity: route.status === 'disqualified' ? 0.6 : 0.85,
                dashArray: route.status === 'disqualified' ? '8 8' : undefined,
              }}
            >
              <Tooltip sticky>{route.label}</Tooltip>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{route.label}</div>
                  <div>Status: {route.status}</div>
                  {typeof route.score === 'number' ? <div>Score: {route.score.toFixed(3)}</div> : null}
                  {typeof route.distanceKm === 'number' ? <div>Distance: {route.distanceKm.toFixed(1)} km</div> : null}
                  {typeof route.durationMin === 'number' ? <div>ETA: {route.durationMin.toFixed(0)} min</div> : null}
                  {route.reason ? <div>Reason: {route.reason}</div> : null}
                </div>
              </Popup>
            </Polyline>
          )
        })}

        {selectedRoute?.coordinates?.[0] ? (
          <Marker position={selectedRoute.coordinates[0]}>
            <Popup>Origin: {selectedRoute.locations?.[0]}</Popup>
          </Marker>
        ) : null}
        {selectedRoute?.coordinates?.length ? (
          <Marker position={selectedRoute.coordinates[selectedRoute.coordinates.length - 1]}>
            <Popup>Destination: {selectedRoute.locations?.[selectedRoute.locations.length - 1]}</Popup>
          </Marker>
        ) : null}

        <FitBounds bounds={bounds} />
      </MapContainer>

      {!routes?.length ? (
        <div className="map-status-banner">No active route yet. Dispatch and raise a ticket to render map alternatives.</div>
      ) : null}
      {isResolving ? (
        <div className="map-status-banner">Resolving route coordinates...</div>
      ) : null}
      {resolveError ? (
        <div className="map-status-banner warning">{resolveError}</div>
      ) : null}
    </div>
  )
}
