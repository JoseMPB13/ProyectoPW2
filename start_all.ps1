# start_all.ps1
Write-Host "Iniciando Sistema Full Stack..." -ForegroundColor Green

# 1. Iniciar Backend
Write-Host "Procesando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; python run.py"

# 2. Iniciar Frontend
Write-Host "Procesando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Ambos servidores han sido lanzados en nuevas ventanas." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:5000"
Write-Host "Frontend: http://localhost:5173"
