import { useState } from 'react'
import { Download, Filter, Search, Eye, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import '../styles/Audit.css'

const AUDIT_LOGS = [
  {
    id: 'AUD-001',
    timestamp: '2024-03-28 14:32:15',
    agent: 'Route',
    action: 'Route optimization executed',
    status: 'success',
    details: 'Optimized route for shipment SH-2401 based on real-time traffic data and weather conditions.',
    guardrails: ['Traffic Analysis', 'Weather Check', 'Fuel Efficiency'],
    reason: 'Detected 15% congestion increase on primary route. Alternative route reduces ETA by 45 minutes while maintaining safety standards.'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-03-28 14:28:42',
    agent: 'Compliance',
    action: 'Hazmat validation completed',
    status: 'success',
    details: 'Validated hazardous materials documentation for shipment SH-2402.',
    guardrails: ['Document Verification', 'Regulatory Compliance', 'Insurance Check'],
    reason: 'All required documentation present and valid. Shipment meets DOT hazmat transportation requirements.'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-03-28 14:25:18',
    agent: 'Logistics',
    action: 'Container allocation updated',
    status: 'info',
    details: 'Reallocated containers to optimize space utilization.',
    guardrails: ['Weight Distribution', 'Volume Optimization', 'Load Balance'],
    reason: 'Improved container utilization from 78% to 92% through intelligent packing algorithm.'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-03-28 14:20:05',
    agent: 'Route',
    action: 'Weather alert processed',
    status: 'warning',
    details: 'Severe weather detected on planned route.',
    guardrails: ['Weather Monitoring', 'Safety Protocol', 'Risk Assessment'],
    reason: 'Storm system detected. Recommended 2-hour delay or alternative route to ensure cargo safety.'
  },
  {
    id: 'AUD-005',
    timestamp: '2024-03-28 14:15:33',
    agent: 'Packaging',
    action: 'Load optimization complete',
    status: 'success',
    details: 'Optimized packaging configuration for shipment SH-2403.',
    guardrails: ['Weight Limits', 'Fragility Check', 'Stacking Rules'],
    reason: 'Applied ML-based packing algorithm. Reduced packaging material by 12% while maintaining protection standards.'
  },
  {
    id: 'AUD-006',
    timestamp: '2024-03-28 14:10:22',
    agent: 'Compliance',
    action: 'Insurance verification failed',
    status: 'error',
    details: 'Insurance coverage insufficient for declared cargo value.',
    guardrails: ['Insurance Validation', 'Value Assessment', 'Risk Coverage'],
    reason: 'Declared value $150,000 exceeds current policy limit of $100,000. Additional coverage required before dispatch.'
  }
]

const ANOMALIES = [
  { type: 'Route Deviation', severity: 'high', count: 2 },
  { type: 'Compliance Warning', severity: 'medium', count: 5 },
  { type: 'Performance Degradation', severity: 'low', count: 3 }
]

const RECOMMENDATIONS = [
  'Increase insurance coverage for high-value shipments',
  'Review route optimization parameters for weather sensitivity',
  'Update packaging algorithms for fragile goods handling'
]

export default function Audit() {
  const [selectedLog, setSelectedLog] = useState(null)
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = AUDIT_LOGS.filter(log => {
    const matchesAgent = filterAgent === 'all' || log.agent === filterAgent
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAgent && matchesStatus && matchesSearch
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />
      case 'warning': return <AlertTriangle size={16} />
      case 'error': return <XCircle size={16} />
      default: return <Info size={16} />
    }
  }

  return (
    <div className="audit-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Intelligence Hub</h1>
          <p>Comprehensive system activity tracking and analysis</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="audit-layout">
        <div className="audit-main">
          <div className="audit-filters">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <Filter size={16} />
              <select 
                className="filter-select"
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
              >
                <option value="all">All Agents</option>
                <option value="Route">Route</option>
                <option value="Compliance">Compliance</option>
                <option value="Logistics">Logistics</option>
                <option value="Packaging">Packaging</option>
              </select>

              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="audit-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Agent</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>
                      <span className="agent-badge">{log.agent}</span>
                    </td>
                    <td>{log.action}</td>
                    <td>
                      <span className={`badge badge-${log.status}`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="audit-sidebar">
          <div className="card">
            <h3 className="sidebar-title">Critical Anomalies</h3>
            <div className="anomalies-list">
              {ANOMALIES.map((anomaly, index) => (
                <div key={index} className="anomaly-item">
                  <div className="anomaly-info">
                    <div className="anomaly-type">{anomaly.type}</div>
                    <span className={`badge badge-${anomaly.severity === 'high' ? 'error' : anomaly.severity === 'medium' ? 'warning' : 'info'}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <div className="anomaly-count">{anomaly.count} occurrences</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="sidebar-title">AI Recommendations</h3>
            <div className="recommendations-list">
              {RECOMMENDATIONS.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-bullet"></div>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Audit Log Details</h2>
              <button className="btn btn-ghost" onClick={() => setSelectedLog(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="label">Log ID</div>
                <div className="modal-value">{selectedLog.id}</div>
              </div>

              <div className="modal-section">
                <div className="label">Timestamp</div>
                <div className="modal-value">{selectedLog.timestamp}</div>
              </div>

              <div className="modal-section">
                <div className="label">Agent</div>
                <div className="modal-value">
                  <span className="agent-badge">{selectedLog.agent}</span>
                </div>
              </div>

              <div className="modal-section">
                <div className="label">Action</div>
                <div className="modal-value">{selectedLog.action}</div>
              </div>

              <div className="modal-section">
                <div className="label">Status</div>
                <div className="modal-value">
                  <span className={`badge badge-${selectedLog.status}`}>
                    {getStatusIcon(selectedLog.status)}
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <div className="label">Details</div>
                <div className="modal-value">{selectedLog.details}</div>
              </div>

              <div className="modal-section">
                <div className="label">Guardrails Checked</div>
                <div className="guardrails-grid">
                  {selectedLog.guardrails.map((guardrail, index) => (
                    <div key={index} className="guardrail-badge">
                      <CheckCircle size={12} />
                      {guardrail}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <div className="label">Decision Rationale</div>
                <div className="modal-rationale">{selectedLog.reason}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
