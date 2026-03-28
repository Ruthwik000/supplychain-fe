import { Link } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <Link to="/audit" className="topbar-icon-btn" id="notifications-btn">
          <Bell size={18} />
          <span className="topbar-notification-dot" />
        </Link>
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
