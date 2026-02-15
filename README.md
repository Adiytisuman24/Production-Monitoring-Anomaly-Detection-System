# Production Health Monitoring System

A mini production platform with deep observability and ML-based anomaly detection.

## 🏗️ Architecture
- **Traffic Generator**: Simulates real-world user activity.
- **Node.js API**: The core service with business logic and metrics exporter.
- **MongoDB**: Stores incidents, anomaly labels, and metric snapshots.
- **Prometheus**: Aggregates time-series metrics from the API.
- **Grafana**: Visualizes system health and P99 latencies.
- **Python ML Engine**: Uses Isolation Forest to detect non-obvious anomalies.
- **MERN UI**: Real-time dashboard for incident management.

## 🚀 Getting Started

### 1. Infrastructure
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
node server.js
```

### 3. ML Engine
```bash
cd python-ml
pip install -r requirements.txt
python app.py
```

### 4. Traffic Generator
```bash
node traffic-generator.js
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Injected Anomalies
- **Latency Spikes**: Simulates slow database or external API.
- **Memory Leaks**: Simulates resource exhaustion.
- **Traffic Bursts**: Simulates flash sales or bot attacks.
- **Error Rates**: Simulates service instability.
