import { useNavigate, useLocation } from 'react-router-dom'
import { Package, Box, Route, Radio, ChevronRight } from 'lucide-react'

const workflowSteps = [
  {
    id: 'packaging',
    label: 'Package Suggestions',
    icon: Package,
    path: '/shipments/new',
    description: 'AI-powered packaging recommendations'
  },
  {
    id: '3d-fitting',
    label: '3D Fitting',
    icon: Box,
    path: '/shipments/new',
    description: 'Visual bin packing optimization'
  },
  {
    id: 'routing',
    label: 'Rerouting Agent',
    icon: Route,
    path: '/live-ops',
    description: 'Intelligent route optimization'
  },
  {
    id: 'tracking',
    label: 'Live Tracking',
    icon: Radio,
    path: '/live-ops',
    description: 'Real-time shipment monitoring'
  }
]

export default function WorkflowFlowchart({ currentStep, runId, onStepChange, currentStepNumber }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleStepClick = (step, index) => {
    // If we're on the new shipment page and have onStepChange callback
    if (onStepChange && location.pathname.includes('/shipments/new')) {
      // Map workflow step to form step number
      if (step.id === 'packaging') {
        onStepChange(1)
      } else if (step.id === '3d-fitting') {
        onStepChange(2)
      } else if (step.id === 'routing' || step.id === 'tracking') {
        // Navigate to live-ops for routing/tracking steps
        if (runId) {
          navigate(step.path, { state: { runId } })
        } else {
          navigate(step.path)
        }
      }
    } else {
      // Default navigation behavior
      if (runId) {
        navigate(step.path, { state: { runId } })
      } else {
        navigate(step.path)
      }
    }
  }

  const getCurrentStepIndex = () => {
    if (location.pathname.includes('/shipments/new')) {
      return currentStep === '3d-fitting' ? 1 : 0
    }
    if (location.pathname.includes('/live-ops')) {
      return currentStep === 'tracking' ? 3 : 2
    }
    return -1
  }

  const activeIndex = getCurrentStepIndex()

  return (
    <div className="workflow-flowchart">
      {workflowSteps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === activeIndex
        const isCompleted = index < activeIndex
        const isClickable = true

        return (
          <div key={step.id} className="workflow-step-wrapper">
            <button
              className={`workflow-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleStepClick(step, index)}
              disabled={!isClickable}
              title={step.description}
            >
              <div className="workflow-step-icon">
                <Icon size={20} />
              </div>
              <div className="workflow-step-content">
                <div className="workflow-step-label">{step.label}</div>
                <div className="workflow-step-description">{step.description}</div>
              </div>
            </button>
            {index < workflowSteps.length - 1 && (
              <div className={`workflow-connector ${isCompleted ? 'completed' : ''}`}>
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
