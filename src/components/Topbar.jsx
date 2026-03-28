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
      </div>
    </header>
  )
}
