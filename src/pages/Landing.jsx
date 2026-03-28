import { useNavigate } from 'react-router-dom'
import { Shield, Package, Truck, Route, ShieldCheck, Zap, Clock, BarChart3, Target, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Packaging Intelligence',
    desc: 'AI-driven container optimization with real-time load balancing and space utilization algorithms.',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    icon: Truck,
    title: 'Logistics Optimization',
    desc: 'Multi-modal transport orchestration with predictive cost modeling and fleet coordination.',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  {
    icon: Route,
    title: 'Adaptive Routing',
    desc: 'Dynamic path computation with weather, congestion, and risk factor integration in real-time.',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance Guardrails',
    desc: 'Automated regulatory validation across jurisdictions with continuous audit trail generation.',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.1)',
  },
]

const metrics = [
  { value: '<50ms', label: 'Agent Latency' },
  { value: '34%', label: 'Cost Reduction' },
  { value: '97.8%', label: 'Container Utilization' },
  { value: '99.9%', label: 'Compliance Rate' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="sidebar-logo-icon">
            <Shield size={18} color="white" />
          </div>
          <h1>AegisChain</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Launch System <ArrowRight size={16} />
        </button>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-grid" />
        <div className="landing-hero-glow" />

        <div className="landing-hero-badge">
          <Zap size={14} />
          AI-Powered Logistics Command Center
        </div>

        <h1>Precision Logistics Intelligence</h1>

        <p>
          Orchestrate intelligent agents for packaging, logistics, routing, and compliance — 
          all unified in a single real-time command interface.
        </p>

        <div className="landing-hero-cta">
          <button
            className="btn btn-primary"
            id="launch-system-btn"
            onClick={() => navigate('/dashboard')}
          >
            Launch System <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '12px 32px', fontSize: '1rem', borderRadius: '12px' }}>
            View Documentation
          </button>
        </div>
      </section>

      <section className="landing-features">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="label" style={{ color: '#3b82f6', marginBottom: '12px' }}>Intelligent Agents</p>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '12px' }}>
            Four Agents. One Mission.
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Each agent operates autonomously while collaborating across the logistics pipeline.
          </p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div className="landing-feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="landing-feature-icon" style={{ background: f.bg }}>
                  <Icon size={24} color={f.color} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="landing-metrics">
        <div className="landing-metrics-inner">
          {metrics.map((m, i) => (
            <div className="landing-metric-item" key={i}>
              <h3>{m.value}</h3>
              <p>{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 AegisChain — Precision Logistics Intelligence. All rights reserved.</p>
      </footer>
    </div>
  )
}
