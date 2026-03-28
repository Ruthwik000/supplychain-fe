import { Search, Bell, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search className="topbar-search-icon" size={16} />
        <input type="text" placeholder="Search shipments, routes, agents..." />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" id="notifications-btn">
          <Bell size={18} />
          <span className="topbar-notification-dot" />
        </button>
        <ThemeToggle />
        <button className="topbar-icon-btn" id="settings-btn">
          <Settings size={18} />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">AC</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">Admin Console</span>
            <span className="topbar-user-role">Operations Lead</span>
          </div>
        </div>
      </div>
    </header>
  )
}
