import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, Search, ArrowUpRight } from 'lucide-react'

const shipmentData = [
  { id: 'SHP-7291', origin: 'Hamburg, DE', destination: 'Frankfurt, DE', status: 'In Transit', risk: 'Low', eta: '2h 14m', agent: 'Route Engine', type: 'success', value: '$12,400' },
  { id: 'SHP-7292', origin: 'Amsterdam, NL', destination: 'Rotterdam, NL', status: 'Processing', risk: 'Medium', eta: '5h 30m', agent: 'Logistics AI', type: 'warning', value: '$8,200' },
  { id: 'SHP-7293', origin: 'Shanghai, CN', destination: 'Singapore, SG', status: 'In Transit', risk: 'Low', eta: '18h 45m', agent: 'Compliance AI', type: 'success', value: '$45,800' },
  { id: 'SHP-7294', origin: 'New York, US', destination: 'Los Angeles, US', status: 'Delayed', risk: 'High', eta: '24h 10m', agent: 'Route Engine', type: 'error', value: '$22,100' },
  { id: 'SHP-7295', origin: 'Mumbai, IN', destination: 'Dubai, AE', status: 'In Transit', risk: 'Low', eta: '8h 22m', agent: 'Packaging AI', type: 'success', value: '$18,600' },
  { id: 'SHP-7296', origin: 'Tokyo, JP', destination: 'Seoul, KR', status: 'Completed', risk: 'Low', eta: 'Delivered', agent: 'All Agents', type: 'success', value: '$31,200' },
  { id: 'SHP-7297', origin: 'London, UK', destination: 'Paris, FR', status: 'In Transit', risk: 'Medium', eta: '3h 15m', agent: 'Route Engine', type: 'warning', value: '$9,800' },
  { id: 'SHP-7298', origin: 'Sydney, AU', destination: 'Melbourne, AU', status: 'Processing', risk: 'Low', eta: '6h 45m', agent: 'Packaging AI', type: 'success', value: '$14,500' },
]

export default function Shipments() {
  const navigate = useNavigate()

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

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search by ID, origin, destination..."
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
          <select className="form-select" style={{ minWidth: '140px' }}>
            <option>All Statuses</option>
            <option>In Transit</option>
            <option>Processing</option>
            <option>Delayed</option>
            <option>Completed</option>
          </select>
          <select className="form-select" style={{ minWidth: '120px' }}>
            <option>All Risks</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={14} /> Filter
          </button>
          <button className="btn btn-ghost">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
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
              {shipmentData.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary-light)' }}>
                    {s.id}
                  </td>
                  <td>{s.origin}</td>
                  <td>{s.destination}</td>
                  <td><span className={`badge badge-${s.type}`}>{s.status}</span></td>
                  <td>
                    <span className={`badge badge-${s.risk === 'Low' ? 'success' : s.risk === 'Medium' ? 'warning' : 'error'}`}>
                      {s.risk}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.eta}</td>
                  <td style={{ fontWeight: 600 }}>{s.value}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.agent}</td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'var(--space-5)', padding: '0 var(--space-2)'
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing 1-8 of 1,247 shipments
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Previous</button>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>1</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>2</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>3</button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Next</button>
        </div>
      </div>
    </div>
  )
}
