import { useState } from 'react'
import { Package, Truck, Route, Shield, MapPin, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import '../styles/LiveOps.css'

const SHIPMENTS = [
  { id: 'SH-2401', origin: 'New York', destination: 'Los Angeles', status: 'in-transit', progress: 65, x: 25, y: 45 },
  { id: 'SH-2402', origin: 'Chicago', destination: 'Miami', status: 'in-transit', progress: 40, x: 60, y: 30 },
  { id: 'SH-2403', origin: 'Seattle', destination: 'Boston', status: 'in-transit', progress: 80, x: 75, y: 55 }
]

const AGENTS = [
  { name: 'Packaging', icon: Package, status: 'active', efficiency: 94, latency: '12ms', color: '#3b82f6' },
  { name: 'Logistics', icon: Truck, status: 'active', efficiency: 91, latency: '18ms', color: '#22c55e' },
  { name: 'Route', icon: Route, status: 'active', efficiency: 96, latency: '8ms', color: '#f59e0b' },
  { name: 'Compliance', icon: Shield, status: 'active', efficiency: 98, latency: '15ms', color: '#8b5cf6' }
]

const AUDIT_FEED = [
  { time: '2m ago', agent: 'Route', action: 'Optimized route SH-2401', status: 'success' },
  { time: '5m ago', agent: 'Compliance', action: 'Validated shipment SH-2402', status: 'success' },
  { time: '8m ago', agent: 'Logistics', action: 'Container allocation updated', status: 'info' },
  { time: '12m ago', agent: 'Packaging', action: 'Load optimization complete', status: 'success' },
  { time: '15m ago', agent: 'Route', action: 'Weather alert processed', status: 'warning' }
]

export default function LiveOps() {
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showReroute, setShowReroute] = useState(false)

  const handleReroute = () => {
    setShowReroute(true)
    setTimeout(() => {
      setShowReroute(false)
    }, 3000)
  }

  return (
    <div className="live-ops-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Live Operations</h1>
          <p>Real-time shipment monitoring and control</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <Activity size={16} />
            System Health
          </button>
          <button className="btn btn-primary" onClick={handleReroute}>
            <AlertCircle size={16} />
            Raise Ticket
          </button>
        </div>
      </div>

      <div className="live-ops-layout">
        <div className="live-ops-main">
          <div className="map-container">
            <div className="map-bg"></div>
            
            <div className="map-overlay-cards">
              <div className="map-overlay-card">
                <div className="label">Active Shipments</div>
                <div className="value">{SHIPMENTS.length}</div>
              </div>
              <div className="map-overlay-card">
                <div className="label">In-Transit Value</div>
                <div className="value">$2.4M</div>
              </div>
            </div>

            {SHIPMENTS.map(shipment => (
              <div
                key={shipment.id}
                className={`map-marker ${selectedShipment?.id === shipment.id ? 'active' : ''}`}
                style={{ left: `${shipment.x}%`, top: `${shipment.y}%` }}
                onClick={() => setSelectedShipment(shipment)}
              >
                <div className="map-marker-pulse"></div>
              </div>
            ))}

            {showReroute && (
              <svg className="map-route-overlay" width="100%" height="100%">
                <defs>
                  <linearGradient id="oldRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="newRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 150 200 Q 300 150, 450 220"
                  stroke="url(#oldRoute)"
                  strokeWidth="2"
                  fill="none"
                  className="route-fade-out"
                />
                <path
                  d="M 150 200 Q 300 250, 450 220"
                  stroke="url(#newRoute)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  className="route-animate-in"
                />
              </svg>
            )}

            {selectedShipment && (
              <div className="map-shipment-detail" style={{ left: `${selectedShipment.x + 5}%`, top: `${selectedShipment.y}%` }}>
                <div className="shipment-detail-header">
                  <span className="shipment-detail-id">{selectedShipment.id}</span>
                  <span className="badge badge-success">{selectedShipment.status}</span>
                </div>
                <div className="shipment-detail-route">
                  <MapPin size={12} />
                  <span>{selectedShipment.origin} → {selectedShipment.destination}</span>
                </div>
                <div className="shipment-detail-progress">
                  <span className="label">Progress</span>
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${selectedShipment.progress}%`, background: 'var(--success)' }}
                    ></div>
                  </div>
                  <span className="progress-value">{selectedShipment.progress}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="agent-status-panel">
            <h3>Agent Status</h3>
            <div className="agent-grid">
              {AGENTS.map((agent, index) => (
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
                      <span className="metric-value">{agent.efficiency}%</span>
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
              {AUDIT_FEED.map((item, index) => (
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
            <div className="notification-title">Reroute Initiated</div>
            <div className="notification-text">AI agents are calculating optimal alternative route</div>
          </div>
        </div>
      )}
    </div>
  )
}
