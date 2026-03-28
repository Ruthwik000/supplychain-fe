import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import NewShipment from './pages/NewShipment'
import LiveOps from './pages/LiveOps'
import Audit from './pages/Audit'

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {isLanding ? (
        <Routes>
          <Route path="/" element={<Landing />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/shipments/new" element={<NewShipment />} />
            <Route path="/live-ops" element={<LiveOps />} />
            <Route path="/audit" element={<Audit />} />
          </Routes>
        </Layout>
      )}
    </>
  )
}

export default App
