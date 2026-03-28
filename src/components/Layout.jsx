import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="layout-content">
        <Topbar />
        <main className="main-content">
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
