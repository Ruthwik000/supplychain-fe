# AegisChain – Precision Logistics Intelligence

A production-grade, AI-powered logistics command center that orchestrates multiple intelligent agents for real-time shipment management, compliance validation, and route optimization.

## Features

### Multi-Agent System
- **Packaging Agent**: ML-driven container optimization with load balancing
- **Logistics Agent**: Autonomous vehicle allocation and fleet management
- **Route Agent**: Dynamic path computation with weather and traffic integration
- **Compliance Agent**: Automated regulatory validation and audit trails

### Application Pages

1. **Landing Page** (`/`)
   - Hero section with animated grid background
   - Feature showcase for all four agents
   - Performance metrics display
   - CTA to launch system

2. **Dashboard** (`/dashboard`)
   - Real-time KPI cards (Cost Savings, Utilization, Safety, Active Shipments)
   - 7-day logistics efficiency chart
   - Route risk breakdown
   - Agent telemetry monitoring
   - Live shipments table

3. **Shipments** (`/shipments`)
   - Comprehensive shipment list with filtering
   - Search by ID, origin, destination
   - Status and risk indicators
   - Export functionality

4. **New Shipment Flow** (`/shipments/new`)
   - **Step 1**: Cargo specifications with AI insights
   - **Step 2**: Vehicle configuration and load layout
   - **Step 3**: Route selection with compliance guardrails
   - **Step 4**: Final review with route visualization
   - AI execution pipeline animation

5. **Live Operations** (`/live-ops`)
   - Interactive map with shipment markers
   - Real-time agent status monitoring
   - Live audit feed timeline
   - Reroute simulation with animated transitions

6. **Audit Intelligence Hub** (`/audit`)
   - Comprehensive audit log table
   - Advanced filtering (agent, status, search)
   - Detailed rationale modals
   - Critical anomalies panel
   - AI recommendations

## Design System

### Colors
- Background: `#0A0A0A`
- Surface: `#111827`
- Primary: `#1E3A8A`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Typography
- Headings: Sora
- Body: Inter
- 8px grid system

### Components
- Cards with 12px border radius
- KPI tiles with animated values
- Data tables with hover states
- Timeline for audit logs
- Progress bars with smooth animations
- Status badges
- Modal overlays
- Stepper for multi-step flows
- Interactive map container

## Tech Stack

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon system
- **Vite** - Build tool and dev server

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx       # Main layout wrapper
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── Topbar.jsx       # Top navigation bar
├── pages/
│   ├── Landing.jsx      # Landing page
│   ├── Dashboard.jsx    # System overview
│   ├── Shipments.jsx    # Shipment list
│   ├── NewShipment.jsx  # Multi-step shipment creation
│   ├── LiveOps.jsx      # Real-time operations
│   └── Audit.jsx        # Audit intelligence hub
├── styles/
│   ├── NewShipment.css  # Shipment flow styles
│   ├── LiveOps.css      # Live ops styles
│   └── Audit.css        # Audit page styles
├── App.jsx              # Root component with routing
├── main.jsx             # Application entry point
└── index.css            # Global styles and design system
```

## Key Interactions

### Shipment Creation Flow
1. Navigate to Dashboard → Click "New Shipment"
2. Fill cargo specifications → AI provides recommendations
3. Select vehicle category → View efficiency metrics
4. Choose route → Validate compliance guardrails
5. Review summary → Confirm and dispatch
6. Watch AI execution pipeline → Redirect to Live Ops

### Live Operations
- Click shipment markers to view details
- Monitor real-time agent status
- Raise tickets to simulate rerouting
- View live audit feed

### Audit Intelligence
- Search and filter audit logs
- Click "View" to see detailed rationale
- Review guardrails checked
- Monitor critical anomalies

## Performance Features

- Animated number counters
- Smooth page transitions (fadeIn, slideUp)
- Progress bar animations
- Route path morphing
- Hover elevation effects
- Optimized chart rendering

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - AegisChain Logistics Intelligence Platform
