# CORS Configuration Deployment Check (PowerShell)
Write-Host "=== CORS Configuration Deployment Check ===" -ForegroundColor Green
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray

# Check if all required files exist
Write-Host "`nChecking configuration files..." -ForegroundColor Yellow
$files = @("app/API/cors.php", "app/API/.htaccess", ".htaccess", "apache.conf", ".user.ini")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

# Check if CORS is properly configured in PHP files
Write-Host "`nChecking PHP files for CORS inclusion..." -ForegroundColor Yellow
$phpFiles = Get-ChildItem -Path "app/API" -Filter "*.php" | Where-Object { 
    $_.Name -notin @("cors.php", "error.php", "cors_test.php") 
}

foreach ($file in $phpFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "require_once.*cors\.php") {
        Write-Host "✅ $($file.Name) includes CORS" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $($file.Name) might be missing CORS inclusion" -ForegroundColor Yellow
    }
}

# Test CORS endpoints
Write-Host "`nTesting CORS endpoints..." -ForegroundColor Yellow
Write-Host "Testing production API..." -ForegroundColor Gray

try {
    $headers = @{
        "Origin" = "https://soil-indol.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "https://soil-3tik.onrender.com/API/cors_test.php" -Method Options -Headers $headers -ErrorAction Stop
    Write-Host "✅ CORS Test Response: $($response.StatusCode)" -ForegroundColor Green
    
    # Check for CORS headers
    $corsHeaders = @("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers")
    foreach ($header in $corsHeaders) {
        if ($response.Headers[$header]) {
            Write-Host "✅ $header`: $($response.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "❌ Missing header: $header" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ CORS Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Deployment Check Complete ===" -ForegroundColor Green
