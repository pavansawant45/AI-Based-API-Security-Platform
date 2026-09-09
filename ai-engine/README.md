# AI Engine — Phase 2

> **Status:** Scaffold only — implementation planned for Phase 2 (Month 3–4)

## Planned Stack
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **ML Library:** scikit-learn (Isolation Forest)
- **Model Input:** Behavioral features extracted from request metadata
- **Model Output:** Risk score (0.0 – 1.0) per request

## Phase 2 Deliverables
- Isolation Forest model trained on synthetic traffic data
- REST API endpoint for real-time scoring: `POST /score`
- Circuit breaker integration with the gateway
- Auto-mitigation logic (block / rate-limit / alert based on score)

## Integration Point
The gateway's `aiThreatCheck.js` middleware is the placeholder that will
call this service's `/score` endpoint once implemented.
