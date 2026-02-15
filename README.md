# Production Health Monitoring System

A production platform with deep observability and ML-based anomaly detection.

A production-grade observability and anomaly detection platform that simulates real-world failures, monitors system health in real time, and proactively detects anomalies using both rule-based alerts and ML-based techniques.

This project is designed to mirror how large-scale systems (like those at Apple) are monitored, debugged, and kept reliable under unpredictable conditions.

---

## 🎯 What This Project Proves

* Production health monitoring mindset
* Deep observability and signal correlation
* Failure injection and resilience testing
* Proactive anomaly detection (not just dashboards)
* Backend + Infra + ML integration

This is **not a CRUD app** — it is a **mini production platform**.

---

## 🏗️ High-Level Architecture

```
┌──────────────────┐
│ Traffic Generator│
│ (Burst / Normal) │
└─────────┬────────┘
          │
          ▼
┌──────────────────────────────┐
│ Node.js Backend (Express)    │
│ - Simulated APIs             │
│ - Failure Injection          │
│ - Prometheus Metrics         │
└─────────┬─────────┬──────────┘
          │         │
          │         ▼
          │   MongoDB (Metrics,
          │   Logs, Anomalies)
          ▼
┌──────────────────────────────┐
│ Prometheus                   │
│ - Scrapes metrics            │
│ - Time-series storage        │
└─────────┬────────────────────┘
          ▼
┌──────────────────────────────┐
│ Grafana                      │
│ - P99 latency dashboards     │
│ - Error rate & memory charts │
│ - Alert visualization        │
└─────────┬────────────────────┘
          ▼
┌──────────────────────────────┐
│ Python Anomaly Engine        │
│ - Moving Average             │
│ - Z-Score                    │
│ - Isolation Forest           │
└─────────┬────────────────────┘
          ▼
┌──────────────────────────────┐
│ MERN Live Monitoring UI      │
│ - Real-time charts           │
│ - Alert feed                 │
│ - Anomaly explanations       │
└──────────────────────────────┘
```

---

## 🧠 System Components

### 1️⃣ Traffic & Load Simulation

Simulates real production usage:

* Normal traffic
* Sudden traffic bursts
* Sustained high load

Used to stress the system and validate observability.

---

### 2️⃣ Backend Service (Node.js + Express)

#### Responsibilities

* Handle API requests
* Inject controlled failures
* Export system metrics

#### Simulated APIs

* `/api/orders` – CPU-heavy computation
* `/api/payments` – Random latency spikes
* `/api/search` – Traffic burst simulation

---

### 3️⃣ Failure Injection Engine

Failures are **intentionally injected** to mimic real incidents:

| Failure Type   | Description                |
| -------------- | -------------------------- |
| Latency Spikes | Random delays (500–3000ms) |
| Memory Leaks   | Heap grows per request     |
| Error Bursts   | Random 5xx responses       |
| Traffic Floods | Sudden request storms      |

This allows testing alert accuracy and anomaly detection quality.

---

### 4️⃣ Metrics & Observability

#### Metrics Collected

* Request latency histogram
* P99 latency
* Error rate
* Heap memory usage
* Event loop lag

Metrics are exposed via `/metrics` endpoint and scraped continuously.

---

### 5️⃣ Dashboards & Alerts

#### Dashboards

* Latency heatmaps
* Error rate trends
* Memory growth curves
* Traffic vs CPU correlation

#### Alerts

* P99 latency > threshold
* Error rate spike
* Memory usage monotonic growth

Alerts are designed to **fire before full system failure**.

---

### 6️⃣ ML-Based Anomaly Detection Engine (Python)

A separate service that performs **intelligent anomaly detection** on metrics data.

#### Techniques Used

* **Moving Average** – detects slow degradation
* **Z-Score** – detects sudden spikes
* **Isolation Forest** – detects unknown/unlabeled anomalies

#### Flow

1. Pull metrics from Prometheus / DB
2. Run anomaly detection models
3. Label anomaly windows
4. Persist results to MongoDB
5. Expose results via API

---

### 7️⃣ MERN Live Monitoring UI

#### Frontend (React)

* Real-time charts (WebSockets)
* Alert feed
* Incident timeline
* Anomaly explanations

#### Backend Integration

* Streams live metrics
* Displays correlated anomalies
* Allows replay of past incidents

---

## 📂 Repository Structure

```
production-monitoring-system/
├── backend/
│   ├── services/
│   │   ├── trafficSimulator.js
│   │   ├── anomalyInjector.js
│   │   └── metrics.js
│   ├── routes/
│   ├── app.js
│   └── Dockerfile
│
├── anomaly-engine/
│   ├── isolation_forest.py
│   ├── zscore.py
│   ├── moving_average.py
│   └── service.py
│
├── frontend/
│   ├── src/
│   │   ├── dashboards/
│   │   ├── alerts/
│   │   └── realtime/
│   └── Dockerfile
│
├── monitoring/
│   ├── prometheus.yml
│   ├── alert-rules.yml
│   └── grafana-dashboards/
│
└── docker-compose.yml
```

---

## 🔁 Detailed Data Flow & Signal Correlation Diagram

```
Client / Traffic Generator
        │
        ▼
┌────────────────────────────┐
│ Node.js API (Express)      │
│ - Request handling         │
│ - Failure injection        │
│ - Metrics instrumentation  │
└─────────┬─────────┬────────┘
          │         │
          │         ▼
          │   Prometheus (Scraper)
          ▼
    Grafana UI
```

---

## 🚀 Getting Started

### 1. Infrastructure
```bash
docker-compose up -d
```

### 2. Startup All Services
```powershell
./start.ps1
```

Access:

* Backend API: `http://localhost:4000`
* Metrics: `http://localhost:4000/metrics`
* Grafana: `http://localhost:3001`
* Frontend UI: `http://localhost:5173`

---

## 🧩 Summary

> Designed and built a production-grade monitoring and anomaly detection platform simulating real-world failures such as latency spikes, memory leaks, and traffic bursts. Implemented real-time observability using metrics, dashboards, and alerting, and developed an ML-driven anomaly detection engine leveraging statistical methods and unsupervised learning. Built a MERN-based live monitoring UI to correlate system signals and visualize incidents proactively.

---

## 🔥 Future Enhancements

* Kubernetes deployment
* Distributed tracing
* Auto-remediation actions
* Chaos engineering scenarios
* Multi-region traffic simulation

---

**This project mirrors real-world reliability engineering and observability practices used in large-scale systems.**
