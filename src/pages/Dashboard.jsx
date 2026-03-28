import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Box, ShieldCheck, Truck, Plus, ArrowUpRight, Package, Route as RouteIcon,
} from 'lucide-react'
import {
  AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { listShipmentRuns } from '../lib/shipmentStore'

function statusType(status) {
  if (status === 'FAILED') return 'error'
  if (status === 'PARTIAL') return 'warning'
  return 'success'
}

function formatCurrency(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString()}`
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '--'
  return `${Number(value).toFixed(1)}%`
}

function buildWeekTrend(runs) {
  const now = new Date()
  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - index))
    return date.toLocaleDateString(undefined, { weekday: 'short' })
  })
  const buckets = labels.map((name) => ({ name, routeScore: 0, count: 0 }))

  runs.forEach((run) => {
    const date = new Date(run.createdAt || Date.now())
    if (Number.isNaN(date.getTime())) return
    const diffDays = Math.floor((now - date) / (24 * 60 * 60 * 1000))
    if (diffDays < 0 || diffDays > 6) return
    const bucketIndex = 6 - diffDays
    const score = Number(run.pipelineResult?.initial_route_score || 0) * 100
    buckets[bucketIndex].routeScore += score
    buckets[bucketIndex].count += 1
  })

  return buckets.map((bucket) => ({
    name: bucket.name,
    routeScore: bucket.count ? Number((bucket.routeScore / bucket.count).toFixed(1)) : 0,
  }))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const runs = listShipmentRuns()

  const metrics = useMemo(() => {
    const totalValue = runs.reduce((sum, run) => sum + Number(run.declaredValueUsd || 0), 0)
    const confidenceValues = runs
      .map((run) => Number(run.pipelineResult?.packaging_result?.agent_confidence))
      .filter((value) => Number.isFinite(value))
    const routeScores = runs
      .map((run) => Number(run.pipelineResult?.initial_route_score))
      .filter((value) => Number.isFinite(value))
    const avgConfidence = confidenceValues.length
      ? (confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length) * 100
      : NaN
    const avgRouteScore = routeScores.length
      ? (routeScores.reduce((sum, value) => sum + value, 0) / routeScores.length) * 100
      : NaN

    const inTransit = runs.filter((run) => {
      const status = run.pipelineStatus || run.pipelineResult?.pipeline_status
      return status === 'SUCCESS' || status === 'PARTIAL'
    }).length

    return {
      totalRuns: runs.length,
      inTransit,
      totalValue,
      avgConfidence,
      avgRouteScore,
    }
  }, [runs])

  const latestRun = runs[0] || null
  const latestPipeline = latestRun?.pipelineResult || null
  const trendData = useMemo(() => buildWeekTrend(runs), [runs])
  const riskBreakdown = useMemo(() => {
    const high = runs.filter((run) => (run.pipelineStatus || run.pipelineResult?.pipeline_status) === 'FAILED').length
    const medium = runs.filter((run) => (run.pipelineStatus || run.pipelineResult?.pipeline_status) === 'PARTIAL').length
    const low = runs.filter((run) => (run.pipelineStatus || run.pipelineResult?.pipeline_status) === 'SUCCESS').length
    const total = runs.length || 1
    return [
      { name: 'Low Risk', count: low, pct: Math.round((low / total) * 100), color: 'var(--success)' },
      { name: 'Medium Risk', count: medium, pct: Math.round((medium / total) * 100), color: 'var(--warning)' },
      { name: 'High Risk', count: high, pct: Math.round((high / total) * 100), color: 'var(--error)' },
    ]
  }, [runs])

  const agentRows = [
    {
      name: 'Packaging Agent',
      icon: Package,
      value: formatPercent(Number(latestPipeline?.packaging_result?.agent_confidence || NaN) * 100),
    },
    {
      name: 'Logistics Agent',
      icon: Truck,
      value: latestPipeline?.logistics_result?.total_vehicles_needed ?? '--',
      label: 'Vehicles planned',
    },
    {
      name: 'Route Agent',
      icon: RouteIcon,
      value: formatPercent(Number(latestPipeline?.initial_route_score || NaN) * 100),
    },
    {
      name: 'Compliance Agent',
      icon: ShieldCheck,
      value: latestPipeline?.compliance_results?.length ?? '--',
      label: 'Checks executed',
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>System Overview</h1>
          <p>Live metrics from real shipment runs</p>
        </div>
        <button className="btn btn-primary" id="new-shipment-btn" onClick={() => navigate('/shipments/new')}>
          <Plus size={16} /> New Shipment
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="kpi-card">
          <div className="kpi-header"><span className="kpi-label">In-Transit Value</span><DollarSign size={18} color="#22c55e" /></div>
          <div className="kpi-value">{formatCurrency(metrics.totalValue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><span className="kpi-label">Packing Confidence</span><Box size={18} color="#3b82f6" /></div>
          <div className="kpi-value">{formatPercent(metrics.avgConfidence)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><span className="kpi-label">Route Safety Score</span><ShieldCheck size={18} color="#f59e0b" /></div>
          <div className="kpi-value">{formatPercent(metrics.avgRouteScore)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header"><span className="kpi-label">Active Shipments</span><Truck size={18} color="#a78bfa" /></div>
          <div className="kpi-value">{metrics.inTransit}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>7-Day Route Score Trend</h3>
          {runs.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="routeScore" stroke="#3b82f6" fill="url(#routeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>No run history yet.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Risk Breakdown</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {riskBreakdown.map((risk) => (
              <div key={risk.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{risk.name}</span>
                  <span style={{ color: risk.color, fontSize: '0.82rem', fontWeight: 700 }}>{risk.count}</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${risk.pct}%`, background: risk.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Agent Telemetry</h3>
        <div className="agent-grid">
          {agentRows.map((agent) => {
            const Icon = agent.icon
            return (
              <div className="agent-card" key={agent.name}>
                <div className="agent-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color="#60a5fa" />
                    <span className="agent-card-name">{agent.name}</span>
                  </div>
                  <span className={`badge badge-${metrics.totalRuns ? 'success' : 'info'}`}>
                    {metrics.totalRuns ? 'Live' : 'No Data'}
                  </span>
                </div>
                <div className="agent-card-metric">
                  <span className="agent-card-metric-label">{agent.label || 'Metric'}</span>
                  <span className="agent-card-metric-value">{agent.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '1rem' }}>Recent Shipments</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/shipments')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {runs.length ? runs.slice(0, 6).map((run) => {
                const status = run.pipelineStatus || run.pipelineResult?.pipeline_status || 'PARTIAL'
                return (
                  <tr key={run.runId}>
                    <td style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-light)' }}>
                      {String(run.runId || '').slice(0, 12)}
                    </td>
                    <td>{run.origin || run.requestPayload?.route?.origin || '-'}</td>
                    <td>{run.destination || run.requestPayload?.route?.destination || '-'}</td>
                    <td><span className={`badge badge-${statusType(status)}`}>{status}</span></td>
                    <td>{formatCurrency(run.declaredValueUsd)}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No shipment runs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
