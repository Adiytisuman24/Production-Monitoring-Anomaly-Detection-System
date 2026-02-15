import time
import pandas as pd
from prometheus_api_client import PrometheusConnect
from sklearn.ensemble import IsolationForest
from pymongo import MongoClient
from flask import Flask, jsonify
from flask_cors import CORS
import threading
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Prometheus and MongoDB Config
PROMETHEUS_URL = "http://localhost:9090"
MONGO_URL = "mongodb://localhost:27017"
prom = PrometheusConnect(url=PROMETHEUS_URL, disable_ssl=True)
mongo_client = MongoClient(MONGO_URL)
db = mongo_client.monitoring
anomalies_col = db.anomalies

def fetch_metrics():
    # Fetch P99 latency and Memory usage
    now = datetime.now()
    start_time = now - timedelta(minutes=10)
    
    # Query P99 Latency (histogram quantile)
    latency_query = 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))'
    memory_query = 'node_memory_usage_bytes'
    
    try:
        latency_data = prom.get_metric_range_data(latency_query, start_time=start_time, end_time=now)
        memory_data = prom.get_metric_range_data(memory_query, start_time=start_time, end_time=now)
        
        if not latency_data or not memory_data:
            return None
            
        # Format into DataFrame
        df_latency = pd.DataFrame(latency_data[0]['values'], columns=['timestamp', 'latency'])
        df_memory = pd.DataFrame(memory_data[0]['values'], columns=['timestamp', 'memory'])
        
        df = pd.merge(df_latency, df_memory, on='timestamp')
        df['latency'] = df['latency'].astype(float)
        df['memory'] = df['memory'].astype(float)
        return df
    except Exception as e:
        print(f"Error fetching metrics: {e}")
        return None

def detect_anomalies():
    while True:
        print("Running anomaly detection...")
        df = fetch_metrics()
        
        if df is not None and len(df) > 5:
            # Isolation Forest
            model = IsolationForest(contamination=0.05)
            df['anomaly'] = model.fit_predict(df[['latency', 'memory']])
            
            # -1 indicates an anomaly
            anomalies = df[df['anomaly'] == -1]
            
            for index, row in anomalies.iterrows():
                # Check if we already logged this anomaly recently
                ts = datetime.fromtimestamp(row['timestamp'])
                if not anomalies_col.find_one({"timestamp": ts}):
                    anomalies_col.insert_one({
                        "timestamp": ts,
                        "latency": row['latency'],
                        "memory": row['memory'],
                        "type": "ML_ISOLATION_FOREST",
                        "description": "Detected unusual correlation between latency and memory"
                    })
                    print(f"Anomaly detected at {ts}")
        
        time.sleep(30) # Run every 30 seconds

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    anomalies = list(anomalies_col.find().sort("timestamp", -1).limit(50))
    for a in anomalies:
        a['_id'] = str(a['_id'])
    return jsonify(anomalies)

if __name__ == '__main__':
    # Start detection thread
    thread = threading.Thread(target=detect_anomalies, daemon=True)
    thread.start()
    
    app.run(port=5000)
