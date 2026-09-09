# Product Requirements Document (PRD)
## AI-Based API Security Platform

**Domain:** Network and Information / Cyber Security Group (Group 6), with secondary alignment to Intelligent Systems / Data Science Group (Group 1)
**Document Version:** 1.0
**Project Duration:** 6 months
**Document Owner:** [Your Name(s) / Team]
**Guide:** [Faculty Guide Name — to be filled]

---

## 1. Overview

### 1.1 Purpose
This document defines the product requirements for an AI-based, autonomous API security platform. The platform will monitor API traffic in real time, detect malicious or anomalous behavior using machine learning, and automatically respond to threats without requiring manual intervention. It is designed to be extensible — any developer can onboard their own API to receive the same protection.

### 1.2 Background
APIs are the primary communication layer for nearly all modern applications (banking, e-commerce, healthcare). This has made them a primary attack target, with attackers increasingly bypassing front-end defenses to attack the API layer directly. Existing protection mechanisms (firewalls, WAFs) rely on static, signature-based rules and cannot reliably detect novel or behavior-based attacks.

### 1.3 Product Summary
An intelligent API gateway sitting between clients and backend services, combining:
- Rule-based checks (rate limiting, honeypots, IP filtering)
- AI-based anomaly detection (Isolation Forest behavior scoring)
- Automated mitigation (blocking, rate-limiting, access restriction)
- A live monitoring dashboard for administrators
- Self-service onboarding for third-party developer APIs

---

## 2. Goals and Objectives

### 2.1 Primary Goals
1. Detect known and previously unseen API attack patterns using behavior-based AI analysis, not just fixed rules.
2. Automatically respond to detected threats in real time, minimizing the need for manual security operations.
3. Provide administrators full visibility into traffic and threats via a live dashboard.
4. Generalize protection so any developer can onboard their own API and inherit the same security pipeline.

### 2.2 Success Metrics
| Metric | Target |
|---|---|
| Anomaly detection precision | ≥ 0.85 |
| Anomaly detection recall | ≥ 0.80 |
| False positive rate | < 10% |
| Added latency per request (detection overhead) | < 150 ms |
| Attack categories covered | ≥ 6 (see Section 5) |
| Successful live demo of auto-mitigation | 100% (must work reliably in front of panel) |

*(Precision/recall/latency targets are design goals to benchmark against during evaluation — actual achieved numbers should be recorded once testing is complete, and compared against the base paper's published results: 0.94 precision / 0.91 recall / sub-120ms latency.)*

---

## 3. Target Users / Personas

| Persona | Description | Needs |
|---|---|---|
| **System Administrator** | Manages the security platform itself | Real-time visibility, manual override capability, alerting |
| **Onboarding Developer** | Registers their own API to receive protection | Simple registration flow, per-API dashboard, minimal setup effort |
| **End User (indirect)** | Uses the application protected by the platform | Should experience no disruption unless genuinely malicious |
| **Attacker (adversarial persona)** | Attempts to exploit the API | Should be detected and blocked automatically |

---

## 4. Existing System and Limitations

Most current API protection relies on traditional firewalls and Web Application Firewalls (WAFs), which block traffic based on fixed, predefined rules and known attack signatures. These systems are reactive and rule-bound:
- Cannot detect novel or evolving attack patterns
- No behavior-based analysis — treat all requests independently
- Typically detect and log only; do not always respond automatically
- Poor coverage of authorization-based attacks (e.g., BOLA), which do not look anomalous at the traffic-volume level

---

## 5. Functional Requirements

### 5.1 Core Gateway Module
| ID | Requirement |
|---|---|
| FR-1.1 | The system shall authenticate every incoming request via JWT tokens or API keys. |
| FR-1.2 | The system shall log every request's metadata (IP, endpoint, method, timestamp, headers). |
| FR-1.3 | The system shall enforce configurable rate limits per client/IP. |
| FR-1.4 | The system shall support IP whitelisting and blacklisting, dynamically updatable. |
| FR-1.5 | The system shall generate a request fingerprint (IP + header hash) to detect identity rotation attempts. |

### 5.2 Behavior Analysis Module
| ID | Requirement |
|---|---|
| FR-2.1 | The system shall track per-client request frequency, endpoint diversity, and timing patterns. |
| FR-2.2 | The system shall maintain a rolling behavioral baseline per client/IP. |
| FR-2.3 | The system shall detect sequential/incremental resource ID access patterns (BOLA indicator). |

### 5.3 AI Threat Detection Module
| ID | Requirement |
|---|---|
| FR-3.1 | The system shall compute a real-time anomaly risk score (0–1) per request using an Isolation Forest model. |
| FR-3.2 | The model shall be trained on behavioral features: request frequency, payload size, auth failure count, unique endpoints accessed, timing intervals. |
| FR-3.3 | The system shall fall back to rule-based detection if the AI engine is unavailable (circuit breaker). |

### 5.4 Auto-Mitigation Module
| ID | Requirement |
|---|---|
| FR-4.1 | The system shall automatically block requests exceeding a defined risk threshold. |
| FR-4.2 | The system shall support temporary IP blocking (configurable duration) as well as permanent blacklisting. |
| FR-4.3 | The system shall maintain honeypot endpoints that trigger instant blocking on access. |
| FR-4.4 | The system shall send real-time alerts (email/Slack) when a threat is mitigated. |

### 5.5 Dashboard Module
| ID | Requirement |
|---|---|
| FR-5.1 | The system shall provide an Overview page showing live traffic volume, active alerts, blocked IPs, and threat level. |
| FR-5.2 | The system shall provide a Live Traffic Log page, filterable by IP, endpoint, status code, and time range. |
| FR-5.3 | The system shall provide an Alerts & Incidents page listing all raised security events with severity and resolution status. |
| FR-5.4 | The system shall provide an Admin panel for managing blacklist/whitelist entries and viewing AI engine/circuit breaker health. |

### 5.6 Developer Onboarding Module
| ID | Requirement |
|---|---|
| FR-6.1 | The system shall allow a developer to register their API's base URL, auth type, and sensitive endpoints. |
| FR-6.2 | The system shall run an automated verification check on registration (reachability, auth enforcement, rate-limit behavior, honeypot coverage). |
| FR-6.3 | The system shall dynamically route requests to the correct registered backend based on a unique API identifier. |
| FR-6.4 | The system shall scope dashboard visibility so each developer sees only their own API's traffic and alerts. |

---

## 6. Attack Coverage Scope

### 6.1 Core (must implement)
| Attack | Detection Mechanism |
|---|---|
| DDoS / traffic spikes | Rate limiting + AI risk scoring |
| Credential stuffing / brute force | Failed-login frequency tracking |
| Bot scraping / endpoint probing | Abuse detector (repetitive access patterns) |
| Admin/config path scanning | Honeypot endpoints |
| Unauthorized role access | Role-Based Access Control (RBAC) |
| BOLA (Broken Object Level Authorization) | Sequential resource ID access pattern detection |
| Sensitive business flow abuse | Per-endpoint frequency thresholds on flagged endpoints |

### 6.2 Extended (implement if time permits)
| Attack | Detection Mechanism |
|---|---|
| Broken Object Property Level Authorization | Request body field validation (reject unauthorized field modification) |
| SSRF (Server-Side Request Forgery) | URL parameter pattern matching against internal IP ranges |

### 6.3 Out of Scope (future work)
- Unsafe consumption of third-party APIs
- Adversarial ML evasion resistance
- GraphQL/SOAP/WebSocket/gRPC protocol-specific protections
- Distributed, multi-region scaling
- Formal compliance certification (GDPR/SOC2)

This scope is aligned to the **OWASP API Security Top 10 (2023)** industry standard.

---

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Detection overhead shall not exceed 150ms per request under normal load. |
| NFR-2 | The system shall remain operational (fallback mode) if the AI engine service fails. |
| NFR-3 | The dashboard shall reflect new events within 5 seconds of occurrence (near real-time). |
| NFR-4 | All stored logs shall be timestamped and queryable by time range. |
| NFR-5 | The system shall be containerized (Docker) for reproducible deployment. |

---

## 8. System Architecture

**Flow:** Client Request → API Gateway (Auth + Logging) → Behavior Analysis → AI Threat Detection (Isolation Forest) → Decision Engine → [Allowed: forwarded to backend] or [Blocked: alert + log] → Live Dashboard

**Data stores:**
- **Redis** — rate-limit counters, response cache, IP blacklist/whitelist (fast, in-memory)
- **MongoDB** — user data, request logs, registered API records (persistent)

**Services:**
- Node.js/Express Gateway (core routing, middleware chain)
- Python/FastAPI AI Engine (Isolation Forest scoring, separate service)
- React dashboard frontend
- Prometheus + Grafana (internal metrics/observability)

*(Full block diagram and detailed module descriptions to be attached as Appendix A / referenced from presentation slides.)*

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Gateway | Node.js, Express |
| AI Engine | Python, FastAPI, scikit-learn (Isolation Forest) |
| Cache / Rate Limiting | Redis |
| Database | MongoDB |
| Frontend Dashboard | React, Chart.js |
| Monitoring | Prometheus, Grafana |
| Deployment | Docker, Docker Compose |
| Auth | JWT, API Keys |

---

## 10. Timeline / Phased Delivery Plan (6 Months)

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 1 — Core Gateway** | Month 1–2 | Gateway with auth, logging, rate limiting; synthetic traffic generator (normal + attack) |
| **Phase 2 — AI Integration** | Month 3–4 | Isolation Forest model trained/tested; risk scoring integrated into gateway; auto-mitigation logic; circuit breaker |
| **Phase 3 — Extended Detection & Dashboard** | Month 5 | BOLA and sensitive business flow detection; custom React dashboard (4 pages); alerting (email/Slack) |
| **Phase 4 — Onboarding & Finalization** | Month 6 | Developer onboarding flow; per-API dashboard scoping; end-to-end testing; live demo preparation; documentation |

---

## 11. Assumptions and Constraints

- No real production traffic/attack data is available; training and evaluation will use synthetic data generated to mimic realistic patterns based on published research.
- The system will be demonstrated at single-server scale; distributed scaling is out of scope for the 6-month timeline.
- The project builds on architectural patterns validated in prior open-source and academic work (see Section 12), with original contributions layered on top (BOLA detection, business-flow abuse detection, developer onboarding, custom dashboard).

---

## 12. Reference Base

**Base research paper (primary architectural foundation):**
A. Mittal, P. Keshap, and A. Hosabettu, "AI-Driven Real-Time API Security: Explainable Threat Detection for Cloud Environments," in *2025 IEEE International Carnahan Conference on Security Technology (ICCST)*, 2025, doi: 10.1109/ICCST63435.2025.11293949.

**Supporting literature:**
1. R. Barkworth, S. Tabassum, and A. H. Lashkari, "Detecting IMAP Credential Stuffing Bots Using Behavioural Biometrics," ACM, 2023.
2. A. Jones, M. Bayesh, and R. Jahan, "Unlocking Deeper Understanding: Leveraging Explainable AI for API Anomaly Detection Insights," ICMLC, 2024.
3. H. Pitkar, "Enhancing Kubernetes Security with AI: Anomaly Detection for Cloud-Based Workloads," 2025.

**Industry standard referenced:**
OWASP Foundation, "OWASP API Security Top 10 2023," Open Web Application Security Project, 2023. [Online]. Available: https://owasp.org/API-Security/

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| No real attack data available for training | Use synthetic traffic generation based on published research patterns |
| AI model false positives blocking legitimate traffic | Threshold tuning, manual admin override capability, circuit breaker fallback |
| Scope creep across 10 OWASP categories | Strict phase-wise prioritization (Section 6.1 vs 6.2 vs 6.3) |
| Multi-service architecture complexity slows development | Use Docker Compose for consistent local environment from Month 1 |
| Live demo failure risk | Rehearse specific, reliable demo scenarios (honeypot trigger, rate-limit trigger, BOLA probe) well before presentation |

---

## 14. Out of Scope (Explicit)

- Full enterprise-grade production scaling (millions of requests/second)
- Deep packet inspection of encrypted payload content
- Defense against sophisticated adversarial ML evasion
- Non-REST protocol support (GraphQL, SOAP, WebSocket, gRPC) beyond conceptual design
- Regulatory compliance certification (GDPR, SOC2, etc.)

---

## Appendix A: Glossary

- **BOLA** — Broken Object Level Authorization; an attack where a user manipulates an object ID to access another user's data.
- **Isolation Forest** — An unsupervised machine learning algorithm that isolates anomalies by randomly partitioning data; effective for detecting outliers without labeled attack data.
- **Circuit Breaker** — A fault-tolerance pattern that prevents cascading failures by falling back to a simpler mechanism when a primary service is unavailable.
- **Honeypot Endpoint** — A decoy API path with no legitimate use, deployed to detect malicious scanning activity.
- **RBAC** — Role-Based Access Control; restricts system access based on a user's assigned role.
