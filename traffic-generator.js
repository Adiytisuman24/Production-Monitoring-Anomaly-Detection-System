const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';
const ENDPOINTS = ['/orders', '/payments', '/search'];

async function sendRequest() {
    const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    try {
        const start = Date.now();
        const res = await axios.get(`${BASE_URL}${endpoint}`);
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] GET ${endpoint} - ${res.status} - ${duration}ms`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] GET ${endpoint} - ERROR: ${err.message}`);
    }
}

console.log('Starting Traffic Generator...');
// Random traffic between 5 and 20 requests per second
setInterval(() => {
    const burstCount = Math.floor(Math.random() * 5) + 5;
    for (let i = 0; i < burstCount; i++) {
        sendRequest();
    }
}, 1000);
