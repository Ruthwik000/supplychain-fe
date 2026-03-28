import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Radio, FileText, Shield, Activity } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments', icon: Package },
  { path: '/live-ops', label: 'Live Ops', icon: Radio },
  { path: '/audit', label: 'Audit Logs', icon: FileText },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={18} color="white" />
        </div>
        <h1>AegisChain</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path ||
            (item.path === '/shipments' && location.pathname.startsWith('/shipments'))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          All Systems Operational
        </div>
        <div className="sidebar-system-health">
          <div className="system-health-item">
            <Activity size={12} />
            <span>Uptime: 99.99%</span>
          </div>
          <div className="system-health-item">
            <Activity size={12} />
            <span>Latency: 24ms</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
