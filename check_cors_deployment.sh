#!/bin/bash
# Deployment and CORS verification script

echo "=== CORS Configuration Deployment Check ==="
echo "Date: $(date)"

# Check if all required files exist
echo "Checking configuration files..."
files=("app/API/cors.php" "app/API/.htaccess" ".htaccess" "apache.conf" ".user.ini")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check if CORS is properly configured in PHP files
echo -e "\nChecking PHP files for CORS inclusion..."
php_files=$(find app/API -name "*.php" -not -name "cors.php" -not -name "error.php" -not -name "cors_test.php")
for file in $php_files; do
    if grep -q "require_once.*cors.php" "$file"; then
        echo "✅ $file includes CORS"
    else
        echo "⚠️ $file might be missing CORS inclusion"
    fi
done

# Test CORS endpoints
echo -e "\nTesting CORS endpoints..."
echo "Testing production API..."
curl -I -X OPTIONS \
    -H "Origin: https://soil-indol.vercel.app" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    https://soil-3tik.onrender.com/API/login.php

echo -e "\n=== Deployment Check Complete ==="
