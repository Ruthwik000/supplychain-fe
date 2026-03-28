import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Truck, Route, CheckCircle, AlertTriangle, Shield, FileText, MapPin, Clock, DollarSign, Zap, Info } from 'lucide-react'
import '../styles/NewShipment.css'

const STEPS = [
  { id: 1, label: 'Cargo Specifications' },
  { id: 2, label: 'Vehicle Configuration' },
  { id: 3, label: 'Route & Compliance' },
  { id: 4, label: 'Final Review' }
]

const CARGO_TYPES = ['Electronics', 'Pharmaceuticals', 'Perishables', 'Hazardous Materials', 'General Cargo']
const VEHICLE_CATEGORIES = ['Heavy', 'Mid', 'Light']
const ROUTES = [
  { id: 1, name: 'Route Alpha', distance: '1,245 km', duration: '18h 30m', efficiency: 94, cost: 2850 },
  { id: 2, name: 'Route Beta', distance: '1,180 km', duration: '17h 45m', efficiency: 89, cost: 2650 },
  { id: 3, name: 'Route Gamma', distance: '1,320 km', duration: '19h 15m', efficiency: 91, cost: 2920 }
]

export default function NewShipment() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    cargoType: '',
    quantity: '',
    weight: '',
    volume: '',
    value: '',
    hazardous: false,
    vehicleCategory: 'Mid',
    origin: '',
    destination: '',
    priority: 'Standard',
    selectedRoute: null
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDispatch = () => {
    setIsProcessing(true)
    setTimeout(() => {
      navigate('/live-ops')
    }, 4000)
  }

  return (
    <div className="new-shipment-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Create New Shipment</h1>
          <p>Configure and dispatch intelligent logistics operations</p>
        </div>
      </div>

      <div className="stepper">
        {STEPS.map((step) => (
          <div 
            key={step.id} 
            className={`stepper-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="stepper-number">
              {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
            </div>
            <span className="stepper-label">{step.label}</span>
          </div>
        ))}
      </div>

      {!isProcessing ? (
        <div className="shipment-form-container">
          {currentStep === 1 && <Step1 formData={formData} onChange={handleInputChange} />}
          {currentStep === 2 && <Step2 formData={formData} onChange={handleInputChange} />}
          {currentStep === 3 && <Step3 formData={formData} onChange={handleInputChange} />}
          {currentStep === 4 && <Step4 formData={formData} onDispatch={handleDispatch} />}

          <div className="form-actions">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Continue
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <ExecutionPipeline />
      )}
    </div>
  )
}

function Step1({ formData, onChange }) {
  return (
    <div className="step-content">
      <div className="step-main">
        <div className="step-header">
          <div className="step-badge">STEP 1 OF 4</div>
          <h2>Cargo Specifications</h2>
          <p className="step-description">
            Provide technical details for the inventory batch. These parameters directly influence AI route optimization and risk scoring.
          </p>
        </div>
        
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Cargo Type</label>
            <select 
              className="form-select" 
              value={formData.cargoType}
              onChange={(e) => onChange('cargoType', e.target.value)}
            >
              <option value="">Select cargo type</option>
              {CARGO_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity (Units)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => onChange('quantity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Weight (kg)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00"
                step="0.01"
                value={formData.weight}
                onChange={(e) => onChange('weight', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Volume (m³)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00"
                step="0.01"
                value={formData.volume}
                onChange={(e) => onChange('volume', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Density Index</label>
              <div className="form-input-calculated">
                <span>Calculated Auto</span>
                <Info size={16} color="var(--primary-light)" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Declared Cargo Value (USD)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="$ 0.00"
              value={formData.value}
              onChange={(e) => onChange('value', e.target.value)}
            />
          </div>

          <div className="dangerous-goods-toggle">
            <div className="dangerous-goods-info">
              <AlertTriangle size={20} color="var(--warning)" />
              <div>
                <div className="dangerous-goods-title">Dangerous Goods</div>
                <div className="dangerous-goods-subtitle">Classify as hazardous materials (HAZMAT)</div>
              </div>
            </div>
            <div 
              className={`toggle ${formData.hazardous ? 'active' : ''}`}
              onClick={() => onChange('hazardous', !formData.hazardous)}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-sidebar">
        <div className="card manifest-card">
          <div className="manifest-header">
            <Package size={18} color="var(--primary-light)" />
            <h3>Manifest Summary</h3>
          </div>

          <div className="manifest-status">
            <div className="label">Session State</div>
            <div className="status-badge">
              <span className="status-indicator"></span>
              <span>Actively Drafting</span>
              <span className="badge badge-info">STEP 1</span>
            </div>
          </div>

          <div className="manifest-metrics">
            <div className="manifest-metric">
              <span className="label">Est. Weight</span>
              <span className="value">{formData.weight || '0.00'} kg</span>
            </div>
            <div className="manifest-metric">
              <span className="label">Est. Volume</span>
              <span className="value">{formData.volume || '0.00'} m³</span>
            </div>
            <div className="manifest-metric">
              <span className="label">Value Risk</span>
              <span className="badge badge-success">Low</span>
            </div>
          </div>

          <div className="ai-insight-box">
            <div className="ai-insight-icon">
              <Zap size={16} color="var(--primary-light)" />
            </div>
            <div className="ai-insight-content">
              <div className="ai-insight-title">AI Insight</div>
              <p className="ai-insight-text">
                {formData.cargoType && formData.weight ? 
                  `Fill in quantity and weight to receive real-time container packing suggestions.` :
                  'Complete cargo details to activate AI recommendations.'
                }
              </p>
            </div>
          </div>

          <div className="required-docs">
            <div className="label">Required Documents</div>
            <div className="docs-checklist">
              <div className="doc-item">
                <input type="checkbox" id="doc1" />
                <label htmlFor="doc1">Commercial Invoice</label>
              </div>
              <div className="doc-item">
                <input type="checkbox" id="doc2" />
                <label htmlFor="doc2">Packing List</label>
              </div>
              <div className="doc-item">
                <input type="checkbox" id="doc3" />
                <label htmlFor="doc3">HAZMAT Declaration</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2({ formData, onChange }) {
  return (
    <div className="step-content">
      <div className="step-main">
        <h2>Vehicle Configuration & 3D Engineering View</h2>
        
        <div className="vehicle-tabs">
          {VEHICLE_CATEGORIES.map(category => (
            <button
              key={category}
              className={`vehicle-tab ${formData.vehicleCategory === category ? 'active' : ''}`}
              onClick={() => onChange('vehicleCategory', category)}
            >
              <Truck size={20} />
              <span>{category}</span>
            </button>
          ))}
        </div>

        {/* 3D Viewport */}
        <div className="viewport-3d">
          <div className="viewport-bg">
            <div className="viewport-grid"></div>
            <div className="vehicle-model">
              <div className="vehicle-chassis"></div>
              <div className="cargo-container"></div>
            </div>
          </div>
          
          <div className="viewport-overlays">
            <div className="viewport-overlay-card">
              <div className="label">Stability Index</div>
              <div className="overlay-value">94.2%</div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-fill" style={{ width: '94%', background: 'var(--success)' }}></div>
              </div>
            </div>
            
            <div className="viewport-overlay-card">
              <div className="label">Cargo Fit</div>
              <div className="overlay-value">98.5%</div>
            </div>
            
            <div className="viewport-overlay-card">
              <div className="label">Aero Efficiency</div>
              <div className="overlay-value">91.8%</div>
            </div>
          </div>

          <div className="viewport-controls">
            <button className="viewport-control-btn">
              <Package size={14} />
              <span>Rotate</span>
            </button>
            <button className="viewport-control-btn">
              <Zap size={14} />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        <div className="vehicle-info-grid">
          <div className="vehicle-info-card">
            <div className="label">Efficiency Score</div>
            <div className="vehicle-score">92%</div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-fill" style={{ width: '92%', background: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="vehicle-info-card">
            <div className="label">Uptime</div>
            <div className="vehicle-score">98.5%</div>
          </div>

          <div className="vehicle-info-card">
            <div className="label">Last Sync</div>
            <div className="vehicle-score">2m ago</div>
          </div>

          <div className="vehicle-info-card">
            <div className="label">Telemetry</div>
            <div className="vehicle-score">
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="step-sidebar">
        <div className="card">
          <h3 className="card-title">Manifest Summary</h3>
          <div className="manifest-item">
            <span className="label">Cargo</span>
            <span>{formData.cargoType || 'Not specified'}</span>
          </div>
          <div className="manifest-item">
            <span className="label">Weight</span>
            <span>{formData.weight ? `${formData.weight} kg` : 'Not specified'}</span>
          </div>
          <div className="manifest-item">
            <span className="label">Volume</span>
            <span>{formData.volume ? `${formData.volume} m³` : 'Not specified'}</span>
          </div>
          <div className="manifest-item">
            <span className="label">Value</span>
            <span>{formData.value ? `$${formData.value}` : 'Not specified'}</span>
          </div>
          <div className="manifest-item">
            <span className="label">Hazardous</span>
            <span className={`badge ${formData.hazardous ? 'badge-warning' : 'badge-success'}`}>
              {formData.hazardous ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="manifest-item">
            <span className="label">Estimated Impact</span>
            <span className="badge badge-success">Low</span>
          </div>
          <div className="manifest-item">
            <span className="label">CO₂ Emissions</span>
            <span>245 kg</span>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Technical Telemetry</h3>
          <div className="telemetry-grid">
            <div className="telemetry-item">
              <div className="label">Load Distribution</div>
              <div className="telemetry-value">Balanced</div>
            </div>
            <div className="telemetry-item">
              <div className="label">Center of Gravity</div>
              <div className="telemetry-value">Optimal</div>
            </div>
            <div className="telemetry-item">
              <div className="label">Axle Load</div>
              <div className="telemetry-value">Within Limits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3({ formData, onChange }) {
  const [selectedRoute, setSelectedRoute] = useState(null)

  const handleRouteSelect = (route) => {
    setSelectedRoute(route)
    onChange('selectedRoute', route)
  }

  return (
    <div className="step-content">
      <div className="step-main">
        <h2>Route & Compliance</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Origin Node</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter origin"
              value={formData.origin}
              onChange={(e) => onChange('origin', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination Node</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter destination"
              value={formData.destination}
              onChange={(e) => onChange('destination', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transit Priority</label>
            <select 
              className="form-select"
              value={formData.priority}
              onChange={(e) => onChange('priority', e.target.value)}
            >
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
            </select>
          </div>
        </div>

        <div className="routes-section">
          <h3>Available Routes</h3>
          <div className="routes-list">
            {ROUTES.map(route => (
              <div 
                key={route.id}
                className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                onClick={() => handleRouteSelect(route)}
              >
                <div className="route-header">
                  <h4>{route.name}</h4>
                  <div className="route-efficiency">
                    <span className="label">Efficiency</span>
                    <span className="route-efficiency-value">{route.efficiency}%</span>
                  </div>
                </div>
                <div className="route-details">
                  <div className="route-detail">
                    <MapPin size={14} />
                    <span>{route.distance}</span>
                  </div>
                  <div className="route-detail">
                    <Clock size={14} />
                    <span>{route.duration}</span>
                  </div>
                  <div className="route-detail">
                    <DollarSign size={14} />
                    <span>${route.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="step-sidebar">
        <div className="card">
          <h3 className="card-title">Compliance Guardrails</h3>
          <div className="compliance-list">
            <div className="compliance-item success">
              <CheckCircle size={16} />
              <span>Hazmat Protocol</span>
            </div>
            <div className="compliance-item success">
              <CheckCircle size={16} />
              <span>Weight Limit Validation</span>
            </div>
            <div className="compliance-item success">
              <CheckCircle size={16} />
              <span>Insurance Check</span>
            </div>
            <div className="compliance-item success">
              <CheckCircle size={16} />
              <span>Restricted Zones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step4({ formData, onDispatch }) {
  return (
    <div className="step-content">
      <div className="step-main">
        <h2>Final Review</h2>
        
        <div className="route-visualization">
          <svg width="100%" height="200" viewBox="0 0 600 200">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path
              d="M 50 100 Q 300 50, 550 100"
              stroke="url(#routeGradient)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
            <circle cx="50" cy="100" r="8" fill="#3b82f6" />
            <circle cx="550" cy="100" r="8" fill="#22c55e" />
            <text x="50" y="130" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">
              {formData.origin || 'Origin'}
            </text>
            <text x="550" y="130" fill="var(--text-secondary)" fontSize="12" textAnchor="middle">
              {formData.destination || 'Destination'}
            </text>
          </svg>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <Clock size={20} color="#3b82f6" />
            <div>
              <div className="label">Estimated ETA</div>
              <div className="summary-value">18h 30m</div>
            </div>
          </div>

          <div className="summary-card">
            <DollarSign size={20} color="#22c55e" />
            <div>
              <div className="label">Total Cost</div>
              <div className="summary-value">$2,850</div>
            </div>
          </div>

          <div className="summary-card">
            <Shield size={20} color="#f59e0b" />
            <div>
              <div className="label">Confidence Score</div>
              <div className="summary-value">94%</div>
            </div>
          </div>

          <div className="summary-card">
            <Route size={20} color="#8b5cf6" />
            <div>
              <div className="label">Selected Route</div>
              <div className="summary-value">{formData.selectedRoute?.name || 'Route Alpha'}</div>
            </div>
          </div>
        </div>

        <div className="risk-indicators">
          <h3>Risk Indicators</h3>
          <div className="risk-grid">
            <div className="risk-item">
              <span>Weather</span>
              <span className="badge badge-success">Low</span>
            </div>
            <div className="risk-item">
              <span>Congestion</span>
              <span className="badge badge-warning">Medium</span>
            </div>
            <div className="risk-item">
              <span>Maintenance</span>
              <span className="badge badge-success">Low</span>
            </div>
          </div>
        </div>

        <div className="confirmation-section">
          <label className="confirmation-checkbox">
            <input type="checkbox" />
            <span>I confirm all details are correct and authorize dispatch</span>
          </label>
          <button className="btn btn-success btn-large" onClick={onDispatch}>
            <CheckCircle size={20} />
            Confirm & Dispatch
          </button>
        </div>
      </div>

      <div className="step-sidebar">
        <div className="card">
          <h3 className="card-title">Alternative Routes</h3>
          <div className="alt-routes">
            <div className="alt-route">
              <div className="alt-route-name">Route Beta</div>
              <div className="alt-route-metrics">
                <span>17h 45m</span>
                <span>$2,650</span>
                <span className="badge badge-info">89%</span>
              </div>
            </div>
            <div className="alt-route">
              <div className="alt-route-name">Route Gamma</div>
              <div className="alt-route-metrics">
                <span>19h 15m</span>
                <span>$2,920</span>
                <span className="badge badge-info">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExecutionPipeline() {
  const agents = [
    { name: 'Packaging Agent', status: 'Processing', icon: Package, color: '#3b82f6' },
    { name: 'Logistics Agent', status: 'Optimizing', icon: Truck, color: '#22c55e' },
    { name: 'Route Agent', status: 'Validating', icon: Route, color: '#f59e0b' },
    { name: 'Compliance Agent', status: 'Checking', icon: Shield, color: '#8b5cf6' }
  ]

  return (
    <div className="execution-pipeline">
      <h2>AI Execution Pipeline</h2>
      <p className="pipeline-subtitle">Multi-agent orchestration in progress</p>
      
      <div className="pipeline">
        {agents.map((agent, index) => (
          <div key={index} className="pipeline-item active">
            <div className="pipeline-icon" style={{ background: `${agent.color}20`, color: agent.color }}>
              <agent.icon size={20} />
            </div>
            <div className="pipeline-info">
              <div className="pipeline-name">{agent.name}</div>
              <div className="pipeline-status">{agent.status}</div>
            </div>
            <div className="pipeline-spinner"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
