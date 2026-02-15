import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Activity, AlertTriangle, Shield, Cpu, Database, Zap, Clock, RefreshCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:4000/api';
const ML_BASE = 'http://localhost:5000/api';

const App = () => {
  const [metrics, setMetrics] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [config, setConfig] = useState({
    latency: false,
    memoryLeak: false,
    trafficBurst: false,
    errorRate: false
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Mock metrics for demo/UI if backend is slow to scrape
      // In a real app, we'd query Prometheus or a formatted API
      const newMetric = {
        time: new Date().toLocaleTimeString(),
        latency: Math.random() * (config.latency ? 2000 : 200),
        memory: 50 + (config.memoryLeak ? Math.random() * 200 : Math.random() * 20),
        errors: config.errorRate ? (Math.random() < 0.2 ? 1 : 0) : 0
      };
      
      setMetrics(prev => [...prev.slice(-20), newMetric]);

      // Fetch actual anomalies from ML Engine
      const anomalyRes = await axios.get(`${ML_BASE}/anomalies`);
      setAnomalies(anomalyRes.data);

      const configRes = await axios.get(`${API_BASE}/config`);
      setConfig(configRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [config]);

  const toggleAnomaly = async (type) => {
    try {
      const res = await axios.post(`${API_BASE}/config/toggle`, { type });
      setConfig(res.data.state);
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <Shield className="text-indigo-500" size={40} />
            Sentinel<span className="text-indigo-400">Core</span>
          </h1>
          <p className="text-slate-400 mt-2">Production Health Monitoring & ML Signal Correlation</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium">System Live</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Anomaly Injector
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { id: 'latency', label: 'Latency Spikes', icon: Clock },
                { id: 'memoryLeak', label: 'Memory Leak', icon: Database },
                { id: 'errorRate', label: 'High Error Rate', icon: AlertTriangle },
                { id: 'trafficBurst', label: 'Traffic Burst', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleAnomaly(id)}
                  className={`btn flex items-center justify-between ${config[id] ? 'btn-danger active' : 'btn-danger'}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} />
                    {label}
                  </span>
                  <span className="text-xs">{config[id] ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="glass-card flex-1">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-indigo-400" />
              ML Insights
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-300 font-bold mb-1 uppercase">Algorithm</p>
                <p className="text-sm">Isolation Forest (Scikit-Learn)</p>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-300 font-bold mb-1 uppercase">Correlation</p>
                <p className="text-sm">Latency ↔ Memory Pressure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card h-64">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">P99 Latency (ms)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f27" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161a', border: '1px solid #2d2d39' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#6366f1" fillOpacity={1} fill="url(#colorLat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card h-64">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Heap Memory (MB)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f27" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={12} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#16161a', border: '1px solid #2d2d39' }}
                />
                <Line type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card h-64 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Anomaly Incident Timeline</h3>
            <div className="overflow-y-auto max-h-48 pr-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Metric Signal</th>
                    <th className="pb-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {anomalies.map((anom, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={anom._id} 
                        className="border-b border-slate-800/50"
                      >
                        <td className="py-3 text-slate-400">{new Date(anom.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3">
                          <span className="badge badge-error">ML Detection</span>
                        </td>
                        <td className="py-3 font-mono text-xs">
                          Lat: {anom.latency?.toFixed(2)}ms | Mem: {anom.memory?.toFixed(2)}B
                        </td>
                        <td className="py-3 text-emerald-400">High</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {anomalies.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-500">
                        No anomalies detected in the last 10 minutes. System healthy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
