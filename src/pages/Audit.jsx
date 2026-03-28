import { useEffect, useMemo, useState } from 'react'
import { Download, Filter, Search, Eye, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { getAuditLogs } from '../lib/api'
import '../styles/Audit.css'

function guardrailStatusToUi(status) {
  if (status === 'FAIL') return 'error'
  if (status === 'WARN') return 'warning'
  if (status === 'PASS') return 'success'
  return 'info'
}

function prettifyGuardrail(name) {
  return String(name || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function normalizeLogs(rawLogs) {
  return rawLogs
    .map((entry, index) => {
      const timestamp = new Date(entry.timestamp)
      const timestampText = Number.isNaN(timestamp.getTime())
        ? entry.timestamp || '-'
        : timestamp.toLocaleString()

      return {
        id: `${entry.agent_name || 'agent'}-${entry.timestamp || index}`,
        timestamp: timestampText,
        rawTimestamp: Number.isNaN(timestamp.getTime()) ? 0 : timestamp.getTime(),
        agent: entry.agent_name || 'UnknownAgent',
        action: entry.decision || 'Decision logged',
        status: guardrailStatusToUi(entry.guardrail_status),
        details: entry.decision || 'No details available.',
        guardrails: Array.isArray(entry.guardrails_checked) ? entry.guardrails_checked : [],
        reason: entry.rationale || 'No rationale available.',
      }
    })
    .sort((a, b) => b.rawTimestamp - a.rawTimestamp)
}

function buildAnomalies(logs) {
  const highCount = logs.filter((log) => log.status === 'error').length
  const mediumCount = logs.filter((log) => log.status === 'warning').length
  const lowCount = logs.filter((log) => log.status === 'info').length

  return [
    { type: 'Guardrail Failures', severity: 'high', count: highCount },
    { type: 'Guardrail Warnings', severity: 'medium', count: mediumCount },
    { type: 'Informational Events', severity: 'low', count: lowCount },
  ]
}

function buildRecommendations(logs) {
  const guardrailFrequency = new Map()
  logs.forEach((log) => {
    if (log.status === 'success') return
    log.guardrails.forEach((guardrail) => {
      const key = prettifyGuardrail(guardrail)
      guardrailFrequency.set(key, (guardrailFrequency.get(key) || 0) + 1)
    })
  })

  const ranked = [...guardrailFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => `Review ${name} guardrail thresholds and mitigation playbooks.`)

  if (ranked.length) {
    return ranked
  }

  return [
    'Continue monitoring route and compliance guardrails for drift.',
    'Schedule a weekly audit export for long-term trend analysis.',
    'Investigate latency spikes when agent confidence drops below baseline.',
  ]
}

export default function Audit() {
  const [selectedLog, setSelectedLog] = useState(null)
  const [filterAgent, setFilterAgent] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let canceled = false

    const loadAuditLogs = async () => {
      try {
        setIsLoading(true)
        const logs = await getAuditLogs()
        if (canceled) return
        setAuditLogs(normalizeLogs(logs))
        setLoadError('')
      } catch (error) {
        if (canceled) return
        setLoadError(error instanceof Error ? error.message : 'Unable to load audit logs.')
      } finally {
        if (!canceled) {
          setIsLoading(false)
        }
      }
    }

    loadAuditLogs()

    return () => {
      canceled = true
    }
  }, [])

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesAgent = filterAgent === 'all' || log.agent === filterAgent
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        query.length === 0 ||
        log.action.toLowerCase().includes(query) ||
        log.reason.toLowerCase().includes(query)

      return matchesAgent && matchesStatus && matchesSearch
    })
  }, [auditLogs, filterAgent, filterStatus, searchQuery])

  const anomalies = useMemo(() => buildAnomalies(auditLogs), [auditLogs])
  const recommendations = useMemo(() => buildRecommendations(auditLogs), [auditLogs])
  const agents = useMemo(() => [...new Set(auditLogs.map((log) => log.agent))], [auditLogs])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />
      case 'warning': return <AlertTriangle size={16} />
      case 'error': return <XCircle size={16} />
      default: return <Info size={16} />
    }
  }

  const handleExport = () => {
    window.open('/api/audit/logs/export', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="audit-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Intelligence Hub</h1>
          <p>Comprehensive system activity tracking and analysis</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {loadError ? (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.1)',
            color: 'var(--error)',
            fontSize: '0.82rem',
          }}
        >
          {loadError}
        </div>
      ) : null}

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
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
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
                {isLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filteredLogs.length ? (
                  filteredLogs.map((log) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No logs match current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="audit-sidebar">
          <div className="card">
            <h3 className="sidebar-title">Critical Anomalies</h3>
            <div className="anomalies-list">
              {anomalies.map((anomaly, index) => (
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
              {recommendations.map((rec, index) => (
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
                  {selectedLog.guardrails.length ? (
                    selectedLog.guardrails.map((guardrail, index) => (
                      <div key={index} className="guardrail-badge">
                        <CheckCircle size={12} />
                        {prettifyGuardrail(guardrail)}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No guardrails recorded.</span>
                  )}
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
