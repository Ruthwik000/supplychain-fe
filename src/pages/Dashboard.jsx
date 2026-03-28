import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Box, ShieldCheck, Truck, TrendingUp, TrendingDown,
  Plus, Package, Route as RouteIcon, Brain, ArrowUpRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'

const chartData = [
  { name: 'Mon', efficiency: 82, cost: 45 },
  { name: 'Tue', efficiency: 85, cost: 42 },
  { name: 'Wed', efficiency: 78, cost: 48 },
  { name: 'Thu', efficiency: 91, cost: 38 },
  { name: 'Fri', efficiency: 88, cost: 40 },
  { name: 'Sat', efficiency: 94, cost: 35 },
  { name: 'Sun', efficiency: 92, cost: 37 },
]

const routeRisks = [
  { name: 'Northern Corridor', risk: 12, color: 'var(--success)' },
  { name: 'Eastern Seaboard', risk: 34, color: 'var(--warning)' },
  { name: 'Southern Express', risk: 8, color: 'var(--success)' },
  { name: 'Western Gateway', risk: 56, color: 'var(--error)' },
  { name: 'Central Hub', risk: 22, color: 'var(--warning)' },
]

const agents = [
  { name: 'Packaging AI', efficiency: '97.3%', latency: '32ms', status: 'active', icon: Package, color: '#3b82f6' },
  { name: 'Logistics AI', efficiency: '94.8%', latency: '45ms', status: 'active', icon: Truck, color: '#22c55e' },
  { name: 'Route Engine', efficiency: '99.1%', latency: '28ms', status: 'active', icon: RouteIcon, color: '#f59e0b' },
  { name: 'Compliance AI', efficiency: '99.9%', latency: '18ms', status: 'active', icon: ShieldCheck, color: '#a78bfa' },
]

const shipments = [
  { id: 'SHP-7291', destination: 'Frankfurt, DE', status: 'In Transit', risk: 'Low', eta: '2h 14m', statusType: 'success' },
  { id: 'SHP-7292', destination: 'Rotterdam, NL', status: 'Processing', risk: 'Medium', eta: '5h 30m', statusType: 'warning' },
  { id: 'SHP-7293', destination: 'Singapore, SG', status: 'In Transit', risk: 'Low', eta: '18h 45m', statusType: 'success' },
  { id: 'SHP-7294', destination: 'Los Angeles, US', status: 'Delayed', risk: 'High', eta: '24h 10m', statusType: 'error' },
  { id: 'SHP-7295', destination: 'Dubai, AE', status: 'In Transit', risk: 'Low', eta: '8h 22m', statusType: 'success' },
]

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))

  useEffect(() => {
    let start = 0
    const duration = 1200
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * numericValue))
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplay(numericValue)
    }
    animate()
  }, [numericValue])

  return <>{value.startsWith('$') ? '$' : ''}{display.toLocaleString()}{suffix}</>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.8rem',
      }}>
        <p style={{ color: '#9ca3af', marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}{p.name === 'Efficiency' ? '%' : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()

  const kpis = [
    { label: 'Cost Savings', value: '$284K', change: '+12.3%', positive: true, icon: DollarSign, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Container Utilization', value: '97.8%', change: '+3.1%', positive: true, icon: Box, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Route Safety Score', value: '94.2', change: '-0.8%', positive: false, icon: ShieldCheck, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Active Shipments', value: '1,247', change: '+5.6%', positive: true, icon: Truck, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>System Overview</h1>
          <p>Real-time visibility across all logistics operations</p>
        </div>
        <button className="btn btn-primary" id="new-shipment-btn" onClick={() => navigate('/shipments/new')}>
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div className="kpi-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="kpi-header">
                <span className="kpi-label">{kpi.label}</span>
                <div className="kpi-icon" style={{ background: kpi.bg }}>
                  <Icon size={20} color={kpi.color} />
                </div>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <span className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
                {kpi.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.change}
              </span>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Logistics Efficiency</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>7-day performance trend</p>
            </div>
            <span className="badge badge-success">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="efficiency" name="Efficiency" stroke="#3b82f6" fill="url(#effGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-5)' }}>Route Risk Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {routeRisks.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: r.color }}>{r.risk}%</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${r.risk}%`, background: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Telemetry */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-5)' }}>Agent Telemetry</h3>
        <div className="agent-grid">
          {agents.map((agent, i) => {
            const Icon = agent.icon
            return (
              <div className="agent-card" key={i}>
                <div className="agent-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '8px',
                      background: `${agent.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={18} color={agent.color} />
                    </div>
                    <span className="agent-card-name">{agent.name}</span>
                  </div>
                  <span className="badge badge-success">Online</span>
                </div>
                <div className="agent-card-metric">
                  <span className="agent-card-metric-label">Efficiency</span>
                  <span className="agent-card-metric-value">{agent.efficiency}</span>
                </div>
                <div className="agent-card-metric">
                  <span className="agent-card-metric-label">Latency</span>
                  <span className="agent-card-metric-value">{agent.latency}</span>
                </div>
                <div className="agent-card-metric">
                  <span className="agent-card-metric-label">Uptime</span>
                  <span className="agent-card-metric-value" style={{ color: 'var(--success)' }}>99.99%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Shipments Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1rem' }}>Live Shipments</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/shipments')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Risk</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary-light)' }}>{s.id}</td>
                  <td>{s.destination}</td>
                  <td><span className={`badge badge-${s.statusType}`}>{s.status}</span></td>
                  <td>
                    <span className={`badge badge-${s.risk === 'Low' ? 'success' : s.risk === 'Medium' ? 'warning' : 'error'}`}>
                      {s.risk}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
