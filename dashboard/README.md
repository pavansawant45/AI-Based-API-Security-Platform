# Dashboard — Phase 3

> **Status:** Scaffold only — implementation planned for Phase 3 (Month 5)

## Planned Stack
- **Framework:** React 18+
- **Charts:** Chart.js / Recharts
- **Styling:** Modern CSS with dark mode
- **State:** React Context or Zustand

## Phase 3 Deliverables (4 pages)
1. **Overview** — Live traffic volume, active alerts, blocked IPs, threat level
2. **Live Traffic Log** — Filterable by IP, endpoint, status code, time range
3. **Alerts & Incidents** — Security events with severity and resolution status
4. **Admin Panel** — Manage blacklist/whitelist, view AI engine health

## Data Source
Dashboard will consume data from the gateway's MongoDB `request_logs`
collection and a dedicated REST API that will be added to the gateway.
