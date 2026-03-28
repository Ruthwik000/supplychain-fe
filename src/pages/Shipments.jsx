import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, Search, ArrowUpRight } from 'lucide-react'
import { listShipmentRuns } from '../lib/shipmentStore'

function statusToType(status) {
  if (status === 'FAILED') return 'error'
  if (status === 'PARTIAL') return 'warning'
  return 'success'
}

function statusToLabel(status) {
  if (status === 'FAILED') return 'Blocked'
  if (status === 'PARTIAL') return 'Processing'
  if (status === 'SUCCESS') return 'In Transit'
  return 'Processing'
}

function statusToRisk(status) {
  if (status === 'FAILED') return 'High'
  if (status === 'PARTIAL') return 'Medium'
  return 'Low'
}

function formatCurrency(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString()}`
}

export default function Shipments() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  const runs = listShipmentRuns()
  const shipments = runs.map((record) => {
    const pipelineStatus = record.pipelineStatus || record.pipelineResult?.pipeline_status || 'PARTIAL'
    const status = statusToLabel(pipelineStatus)
    const risk = statusToRisk(pipelineStatus)

    return {
      id: `RUN-${String(record.runId || '').slice(0, 8).toUpperCase()}`,
      runId: record.runId,
      origin: record.origin || record.requestPayload?.route?.origin || 'Unknown Origin',
      destination: record.destination || record.requestPayload?.route?.destination || 'Unknown Destination',
      status,
      risk,
      eta: pipelineStatus === 'FAILED' ? 'On Hold' : 'Live',
      agent: pipelineStatus === 'FAILED' ? 'Compliance AI' : 'Logistics AI',
      type: statusToType(pipelineStatus),
      value: formatCurrency(record.declaredValueUsd),
    }
  })

  const filteredShipments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return shipments.filter((shipment) => {
      const matchesQuery =
        query.length === 0 ||
        shipment.id.toLowerCase().includes(query) ||
        shipment.origin.toLowerCase().includes(query) ||
        shipment.destination.toLowerCase().includes(query)

      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
      const matchesRisk = riskFilter === 'all' || shipment.risk === riskFilter
      return matchesQuery && matchesStatus && matchesRisk
    })
  }, [shipments, searchQuery, statusFilter, riskFilter])

  const handleExport = () => {
    const content = JSON.stringify(filteredShipments, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'shipments-export.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Shipments</h1>
          <p>Monitor and manage all active shipments</p>
        </div>
        <button className="btn btn-primary" id="create-shipment-btn" onClick={() => navigate('/shipments/new')}>
          <Plus size={16} /> New Shipment
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search by ID, origin, destination..."
              style={{ paddingLeft: '36px', width: '100%' }}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select className="form-select" style={{ minWidth: '140px' }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Processing">Processing</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="form-select" style={{ minWidth: '120px' }} value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
            <option value="all">All Risks</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={14} /> Filter
          </button>
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Risk</th>
                <th>ETA</th>
                <th>Value</th>
                <th>Active Agent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length ? (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary-light)' }}>
                      {shipment.id}
                    </td>
                    <td>{shipment.origin}</td>
                    <td>{shipment.destination}</td>
                    <td><span className={`badge badge-${shipment.type}`}>{shipment.status}</span></td>
                    <td>
                      <span className={`badge badge-${shipment.risk === 'Low' ? 'success' : shipment.risk === 'Medium' ? 'warning' : 'error'}`}>
                        {shipment.risk}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{shipment.eta}</td>
                    <td style={{ fontWeight: 600 }}>{shipment.value}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{shipment.agent}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => navigate('/live-ops', { state: { runId: shipment.runId } })}>
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No shipments found with the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'var(--space-5)', padding: '0 var(--space-2)'
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing {filteredShipments.length} of {shipments.length} shipments
        </span>
      </div>
    </div>
  )
}
