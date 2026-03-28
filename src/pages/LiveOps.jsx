import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Package, Truck, Route, Shield, Activity, AlertCircle, CheckCircle } from 'lucide-react'
import LiveRouteMap from '../components/LiveRouteMap'
import { ApiError, getAuditLogs, getPipelineStatus, runReroute } from '../lib/api'
import {
  getLatestShipmentRun,
  getShipmentRun,
  listShipmentRuns,
  upsertShipmentRun,
} from '../lib/shipmentStore'
import '../styles/LiveOps.css'

function toRelativeTime(timestamp) {
  const value = new Date(timestamp)
  if (Number.isNaN(value.getTime())) {
    return 'just now'
  }

  const diff = Math.max(1, Date.now() - value.getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) return `${Math.round(diff / minute)}m ago`
  if (diff < day) return `${Math.round(diff / hour)}h ago`
  return `${Math.round(diff / day)}d ago`
}

function guardrailToFeedStatus(status) {
  if (status === 'FAIL') return 'error'
  if (status === 'WARN') return 'warning'
  return 'success'
}

function toAgentTelemetry(runRecord) {
  const pipelineStatus = runRecord?.pipelineResult?.pipeline_status || runRecord?.pipelineStatus || 'IDLE'
  const warnings = runRecord?.pipelineResult?.warnings || []
  const hasWarnings = warnings.length > 0 || pipelineStatus === 'PARTIAL'
  const hasFailures = pipelineStatus === 'FAILED'
  const logisticsPlans = runRecord?.pipelineResult?.logistics_result?.vehicle_plans || []
  const avgUtilization = logisticsPlans.length
    ? logisticsPlans.reduce((sum, plan) => sum + Number(plan.utilization_pct || 0), 0) / logisticsPlans.length
    : null
  const complianceRows = runRecord?.pipelineResult?.compliance_results || []
  const compliancePassRate = complianceRows.length
    ? (complianceRows.filter((row) => row.status === 'PASS').length / complianceRows.length) * 100
    : null

  return [
    {
      name: 'Packaging',
      icon: Package,
      status: hasFailures ? 'attention' : 'active',
      efficiency: runRecord?.pipelineResult?.packaging_result?.agent_confidence
        ? Math.round(runRecord.pipelineResult.packaging_result.agent_confidence * 100)
        : null,
      latency: '14ms',
      color: '#3b82f6',
    },
    {
      name: 'Logistics',
      icon: Truck,
      status: hasFailures ? 'attention' : 'active',
      efficiency: Number.isFinite(avgUtilization) ? Math.round(avgUtilization) : null,
      latency: '19ms',
      color: '#22c55e',
    },
    {
      name: 'Route',
      icon: Route,
      status: hasWarnings ? 'attention' : 'active',
      efficiency: runRecord?.pipelineResult?.initial_route_score
        ? Math.round(runRecord.pipelineResult.initial_route_score * 100)
        : null,
      latency: '9ms',
      color: '#f59e0b',
    },
    {
      name: 'Compliance',
      icon: Shield,
      status: hasFailures ? 'degraded' : 'active',
      efficiency: Number.isFinite(compliancePassRate) ? Math.round(compliancePassRate) : null,
      latency: '16ms',
      color: '#8b5cf6',
    },
  ]
}

function routeLocations(route) {
  if (!route) return []
  const waypoints = Array.isArray(route.waypoints) ? route.waypoints.filter(Boolean) : []
  return [route.origin, ...waypoints, route.destination].filter(Boolean)
}

function buildRouteCandidates(runRecord, rerouteResult) {
  const baseRoute = runRecord?.requestPayload?.route || null
  const baseLocations = routeLocations(baseRoute)

  if (!rerouteResult?.all_scored_routes?.length) {
    if (!baseRoute || baseLocations.length < 2) {
      return []
    }

    return [
      {
        id: 'current-route',
        label: 'Current Route',
        status: 'selected',
        locations: baseLocations,
        score: runRecord?.pipelineResult?.initial_route_score ?? null,
        distanceKm: null,
        durationMin: null,
        coordinates: [],
        reason: '',
      },
    ]
  }

  const selectedScore = rerouteResult.status === 'REROUTED'
    ? rerouteResult.route_score
    : null
  let selectedClaimed = false

  const rankedRoutes = rerouteResult.all_scored_routes.slice(0, 4)

  return rankedRoutes.map((scoredRoute, index) => {
    let selected = false
    if (rerouteResult.status === 'REROUTED' && !scoredRoute.disqualification_reason) {
      const scoreMatches =
        typeof selectedScore === 'number' && Math.abs((scoredRoute.score || 0) - selectedScore) < 1e-6
      if (!selectedClaimed && scoreMatches) {
        selected = true
        selectedClaimed = true
      }
    }

    const status = scoredRoute.disqualification_reason
      ? 'disqualified'
      : selected
        ? 'selected'
        : 'candidate'
    const locations = routeLocations(scoredRoute.route)

    return {
      id: `route-${index + 1}`,
      label: selected ? `Best Path ${index + 1}` : `Path ${index + 1}`,
      status,
      locations: locations.length >= 2 ? locations : baseLocations,
      score: scoredRoute.score,
      distanceKm: scoredRoute.map_distance_km,
      durationMin: scoredRoute.map_duration_min,
      coordinates: Array.isArray(scoredRoute.map_geometry) ? scoredRoute.map_geometry : [],
      reason: scoredRoute.disqualification_reason || '',
    }
  })
}

function buildReroutePayload(runRecord) {
  const route = runRecord?.requestPayload?.route
  if (!route?.origin || !route?.destination) {
    return null
  }

  const waypoints = Array.isArray(route.waypoints) ? route.waypoints.filter(Boolean) : []
  const eta = (hoursAhead) => new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString()

  return {
    ticket_id: `TKT-${(runRecord?.runId || 'adhoc').slice(0, 8)}-${Date.now().toString().slice(-4)}`,
    original_route: {
      origin: route.origin,
      destination: route.destination,
      waypoints,
      estimated_arrival_time: eta(8),
    },
    disruption_type: 'weather',
    disruption_location: route.origin,
    available_alternatives: [],
    weather_score: runRecord?.requestPayload?.weather_score ?? 0.72,
    road_safety_score: runRecord?.requestPayload?.road_safety_score ?? 0.7,
    estimated_arrival_time: eta(8),
  }
}

export default function LiveOps() {
  const location = useLocation()
  const [runRecord, setRunRecord] = useState(null)
  const [showReroute, setShowReroute] = useState(false)
  const [rerouteMessage, setRerouteMessage] = useState('')
  const [isRerouting, setIsRerouting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [auditFeed, setAuditFeed] = useState([])
  const [rerouteResult, setRerouteResult] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState('')

  const activeRunId = location.state?.runId || runRecord?.runId || null

  useEffect(() => {
    const seededRecord =
      (location.state?.runId ? getShipmentRun(location.state.runId) : null) ||
      getLatestShipmentRun()

    if (seededRecord) {
      setRunRecord(seededRecord)
      if (seededRecord.lastRerouteResult) {
        setRerouteResult(seededRecord.lastRerouteResult)
      }
    }
  }, [location.state?.runId])

  useEffect(() => {
    if (!activeRunId) {
      return undefined
    }

    let canceled = false

    const loadPipeline = async () => {
      try {
        const pipelineResult = await getPipelineStatus(activeRunId)
        if (canceled) return

        setLoadError('')
        setRunRecord((current) => {
          const next = {
            ...(current || {}),
            runId: activeRunId,
            createdAt: current?.createdAt || new Date().toISOString(),
            pipelineResult,
            pipelineStatus: pipelineResult.pipeline_status,
          }
          upsertShipmentRun(next)
          return next
        })
      } catch (error) {
        if (canceled) return

        if (error instanceof ApiError && error.status === 404) {
          setLoadError('Backend cache no longer has this run. Showing latest saved snapshot.')
          return
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to refresh pipeline status.')
      }
    }

    loadPipeline()
    const intervalId = window.setInterval(loadPipeline, 12000)

    return () => {
      canceled = true
      window.clearInterval(intervalId)
    }
  }, [activeRunId])

  useEffect(() => {
    let canceled = false

    const loadAudit = async () => {
      try {
        const logs = await getAuditLogs()
        if (canceled) return

        const normalized = logs
          .slice()
          .reverse()
          .slice(0, 8)
          .map((entry) => ({
            time: toRelativeTime(entry.timestamp),
            agent: (entry.agent_name || 'Agent').replace('Agent', ''),
            action: entry.decision,
            status: guardrailToFeedStatus(entry.guardrail_status),
          }))

        setAuditFeed(normalized)
      } catch {
        if (canceled) return
      }
    }

    loadAudit()
    const intervalId = window.setInterval(loadAudit, 10000)

    return () => {
      canceled = true
      window.clearInterval(intervalId)
    }
  }, [])

  const activeAgents = useMemo(() => toAgentTelemetry(runRecord), [runRecord])
  const inTransitValue = (() => {
    return listShipmentRuns().reduce((total, record) => {
      return total + Number(record.declaredValueUsd || 0)
    }, 0)
  })()

  const routeCandidates = useMemo(() => {
    return buildRouteCandidates(runRecord, rerouteResult)
  }, [runRecord, rerouteResult])

  useEffect(() => {
    if (!routeCandidates.length) {
      setSelectedRouteId('')
      return
    }

    const selected = routeCandidates.find((route) => route.status === 'selected')
    setSelectedRouteId(selected?.id || routeCandidates[0].id)
  }, [routeCandidates])

  const selectedRoute = useMemo(() => {
    return routeCandidates.find((route) => route.id === selectedRouteId) || null
  }, [routeCandidates, selectedRouteId])

  const handleReroute = async () => {
    if (!runRecord) {
      setRerouteMessage('No shipment run found yet. Dispatch a shipment first to raise reroute tickets.')
      setShowReroute(true)
      window.setTimeout(() => setShowReroute(false), 3000)
      return
    }

    setIsRerouting(true)
    try {
      const reroutePayload = buildReroutePayload(runRecord)
      if (!reroutePayload) {
        throw new Error('Origin and destination are required before running route agent rerouting.')
      }
      const nextRerouteResult = await runReroute(reroutePayload)
      setRerouteResult(nextRerouteResult)

      setRunRecord((current) => {
        const next = {
          ...(current || {}),
          lastRerouteResult: nextRerouteResult,
          lastRerouteAt: new Date().toISOString(),
        }
        upsertShipmentRun(next)
        return next
      })

      const nextMessage =
        nextRerouteResult.status === 'REROUTED'
          ? `Route agent selected the best compliant path (score ${(nextRerouteResult.route_score || 0).toFixed(3)}).`
          : 'Route agent found no compliant path. Ticket escalated for manual review.'

      setRerouteMessage(nextMessage)
      setShowReroute(true)
      window.setTimeout(() => setShowReroute(false), 4200)
    } catch (error) {
      setRerouteMessage(error instanceof Error ? error.message : 'Unable to run reroute ticket.')
      setShowReroute(true)
      window.setTimeout(() => setShowReroute(false), 4200)
    } finally {
      setIsRerouting(false)
    }
  }

  return (
    <div className="live-ops-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Live Operations</h1>
          <p>Real-time shipment monitoring and control</p>
          {activeRunId ? (
            <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active run: {activeRunId}
            </p>
          ) : null}
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <Activity size={16} />
            System Health
          </button>
          <button className="btn btn-primary" onClick={handleReroute} disabled={isRerouting}>
            <AlertCircle size={16} />
            {isRerouting ? 'Rerouting...' : 'Raise Ticket'}
          </button>
        </div>
      </div>

      {loadError ? (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.35)',
            color: 'var(--warning)',
            fontSize: '0.82rem',
          }}
        >
          {loadError}
        </div>
      ) : null}

      <div className="live-ops-layout">
        <div className="live-ops-main">
          <div className="map-container">
            <LiveRouteMap routes={routeCandidates} activeRouteId={selectedRouteId} />

            <div className="map-overlay-cards">
              <div className="map-overlay-card">
                <div className="label">Active Shipments</div>
                <div className="value">{listShipmentRuns().length}</div>
              </div>
              <div className="map-overlay-card">
                <div className="label">In-Transit Value</div>
                <div className="value">${inTransitValue.toLocaleString()}</div>
              </div>
              <div className="map-overlay-card">
                <div className="label">Best Path Score</div>
                <div className="value">{typeof selectedRoute?.score === 'number' ? selectedRoute.score.toFixed(3) : '--'}</div>
              </div>
            </div>
          </div>

          <div className="map-route-board card">
            <h3 style={{ marginBottom: '12px' }}>Route Candidates (Agent Ranked)</h3>
            {routeCandidates.length ? (
              <div className="map-route-list">
                {routeCandidates.map((route) => (
                  <button
                    key={route.id}
                    className={`map-route-item ${route.id === selectedRouteId ? 'active' : ''}`}
                    onClick={() => setSelectedRouteId(route.id)}
                    type="button"
                  >
                    <div className="map-route-item-top">
                      <span>{route.label}</span>
                      <span className={`badge ${route.status === 'selected' ? 'badge-success' : route.status === 'disqualified' ? 'badge-error' : 'badge-info'}`}>
                        {route.status}
                      </span>
                    </div>
                    <div className="map-route-item-meta">
                      <span>{route.locations.join(' → ')}</span>
                      {typeof route.score === 'number' ? <span>Score {route.score.toFixed(3)}</span> : null}
                      {typeof route.durationMin === 'number' ? <span>{route.durationMin.toFixed(0)} min</span> : null}
                      {route.reason ? <span>{route.reason}</span> : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Dispatch a shipment, then raise a ticket to let the rerouting agent generate ranked route options.
              </p>
            )}
          </div>

          <div className="agent-status-panel">
            <h3>Agent Status</h3>
            <div className="agent-grid">
              {activeAgents.map((agent, index) => (
                <div key={index} className="agent-status-card">
                  <div className="agent-status-header">
                    <div className="agent-status-icon" style={{ background: `${agent.color}20`, color: agent.color }}>
                      <agent.icon size={18} />
                    </div>
                    <div className="agent-status-dot"></div>
                  </div>
                  <div className="agent-status-name">{agent.name}</div>
                  <div className="agent-status-metrics">
                    <div className="agent-status-metric">
                      <span className="label">Efficiency</span>
                      <span className="metric-value">
                        {typeof agent.efficiency === 'number' ? `${agent.efficiency}%` : '--'}
                      </span>
                    </div>
                    <div className="agent-status-metric">
                      <span className="label">Latency</span>
                      <span className="metric-value">{agent.latency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="live-ops-sidebar">
          <div className="card">
            <h3 className="sidebar-title">Live Audit Feed</h3>
            <div className="timeline">
              {(auditFeed.length ? auditFeed : [{ time: 'now', agent: 'System', action: 'Waiting for audit events', status: 'info' }]).map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className={`timeline-dot ${item.status}`}></div>
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-text">
                    <strong>{item.agent}:</strong> {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showReroute && (
        <div className="reroute-notification">
          <CheckCircle size={20} />
          <div>
            <div className="notification-title">Reroute Update</div>
            <div className="notification-text">{rerouteMessage}</div>
          </div>
        </div>
      )}
    </div>
  )
}
