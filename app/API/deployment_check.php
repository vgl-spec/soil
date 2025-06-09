<?php
echo "Deployment check - " . date('Y-m-d H:i:s') . "\n";
echo "Git commit: 2621154\n";
echo "File exists: " . (file_exists('db.php') ? 'Yes' : 'No') . "\n";

// Check if environment variables are available
echo "Environment variables:\n";
echo "DATABASE_URL: " . (getenv('DATABASE_URL') ? 'Set' : 'Not set') . "\n";
echo "DB_HOST: " . (getenv('DB_HOST') ? getenv('DB_HOST') : 'Not set') . "\n";
echo "DB_NAME: " . (getenv('DB_NAME') ? getenv('DB_NAME') : 'Not set') . "\n";
echo "DB_USER: " . (getenv('DB_USER') ? getenv('DB_USER') : 'Not set') . "\n";
echo "DB_PASS: " . (getenv('DB_PASS') ? 'Set' : 'Not set') . "\n";

// Check PostgreSQL extension
echo "PostgreSQL extension: " . (extension_loaded('pdo_pgsql') ? 'Available' : 'NOT AVAILABLE') . "\n";
echo "PDO drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
?>
