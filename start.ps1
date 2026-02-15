# Startup script for Production Health Monitoring System

# 1. Start Infrastructure
Write-Host "Starting Infrastructure (Docker)..." -ForegroundColor Cyan
docker-compose up -d

# 2. Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; node server.js"

# 3. Start Python ML Engine
Write-Host "Starting Python ML Engine..." -ForegroundColor Cyan
# Assuming python is in path and pip installed
Start-Process powershell -ArgumentList "-NoExit -Command cd python-ml; pip install -r requirements.txt; python app.py"

# 4. Start Traffic Generator
Write-Host "Starting Traffic Generator..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command node traffic-generator.js"

# 5. Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Write-Host "All services started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend: http://localhost:4000"
Write-Host "Prometheus: http://localhost:9090"
Write-Host "Grafana: http://localhost:3001"
