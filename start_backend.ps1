# start_all.ps1
Write-Host "Iniciando Sistema Full Stack..." -ForegroundColor Green

# 1. Iniciar Backend
Write-Host "Procesando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; python run.py"

# 2. Frontend eliminado
Write-Host "Frontend ha sido eliminado." -ForegroundColor Yellow

Write-Host "✅ Servidor Backend iniciado." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:5000"
