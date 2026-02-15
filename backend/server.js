const express = require('express');
const mongoose = require('mongoose');
const client = require('prom-client');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const errorCounter = new client.Counter({
  name: 'app_errors_total',
  help: 'Total number of application errors',
  labelNames: ['route']
});

const memoryUsageGauge = new client.Gauge({
  name: 'node_memory_usage_bytes',
  help: 'Current nodejs memory usage'
});

// Anomaly State
let anomaliesEnabled = {
  latency: false,
  memoryLeak: false,
  trafficBurst: false,
  errorRate: false
};

let memoryLeakArray = [];

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
      .observe(duration);
    
    memoryUsageGauge.set(process.memoryUsage().heapUsed);
  });
  next();
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/monitoring')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Incident Schema
const IncidentSchema = new mongoose.Schema({
  type: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  metrics: Object
});
const Incident = mongoose.model('Incident', IncidentSchema);

// Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Control API
app.get('/api/config', (req, res) => {
  res.json(anomaliesEnabled);
});

app.post('/api/config/toggle', (req, res) => {
  const { type } = req.body;
  if (type in anomaliesEnabled) {
    anomaliesEnabled[type] = !anomaliesEnabled[type];
    if (type === 'memoryLeak' && !anomaliesEnabled[type]) {
        memoryLeakArray = []; // Clear leak
    }
    res.json({ success: true, state: anomaliesEnabled });
  } else {
    res.status(400).json({ error: 'Invalid anomaly type' });
  }
});

// Business Endpoints
app.get('/api/orders', async (req, res) => {
  // CPU-heavy simulation
  if (anomaliesEnabled.latency) {
    const delay = 500 + Math.random() * 2500;
    await new Promise(r => setTimeout(r, delay));
  }

  if (anomaliesEnabled.errorRate && Math.random() < 0.15) {
    errorCounter.labels('/api/orders').inc();
    return res.status(500).json({ error: 'Injected production error in orders' });
  }

  res.json({ message: 'Order processed', id: Math.floor(Math.random() * 1000) });
});

app.get('/api/payments', async (req, res) => {
  // Latency injection
  if (anomaliesEnabled.latency || Math.random() < 0.05) {
    const delay = Math.random() * 3000;
    await new Promise(r => setTimeout(r, delay));
  }

  if (anomaliesEnabled.memoryLeak) {
    for(let i=0; i<10000; i++) memoryLeakArray.push({ data: Math.random() });
  }

  res.json({ status: 'Payment successful', transactionId: 'TXN-' + Date.now() });
});

app.get('/api/search', async (req, res) => {
  // Traffic burst simulation - handled by a loop in client or here?
  // Let's make search slightly heavier
  const start = Date.now();
  while (Date.now() - start < 50) {} // 50ms sync block to spike CPU

  res.json({ results: ['item1', 'item2', 'item3'] });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
