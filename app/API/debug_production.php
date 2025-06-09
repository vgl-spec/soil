<?php
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== PHP Environment Debug ===\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "\n";
echo "Current working directory: " . getcwd() . "\n";
echo "Script directory: " . __DIR__ . "\n";

echo "\n=== PDO Drivers ===\n";
if (class_exists('PDO')) {
    $drivers = PDO::getAvailableDrivers();
    echo "Available drivers: " . implode(', ', $drivers) . "\n";
    echo "PostgreSQL driver available: " . (in_array('pgsql', $drivers) ? 'YES' : 'NO') . "\n";
} else {
    echo "PDO class not available!\n";
}

echo "\n=== Environment Variables ===\n";
echo "DB_HOST: " . (getenv('DB_HOST') ?: 'not set') . "\n";
echo "DB_PORT: " . (getenv('DB_PORT') ?: 'not set') . "\n";
echo "DB_NAME: " . (getenv('DB_NAME') ?: 'not set') . "\n";
echo "DB_USER: " . (getenv('DB_USER') ?: 'not set') . "\n";
echo "DB_PASSWORD: " . (getenv('DB_PASSWORD') ? 'SET (hidden)' : 'not set') . "\n";

echo "\n=== SSL Environment Variables ===\n";
echo "PGSSLMODE: " . (getenv('PGSSLMODE') ?: 'not set') . "\n";
echo "PGSSLROOTCERT: " . (getenv('PGSSLROOTCERT') ?: 'not set') . "\n";

echo "\n=== Certificate Check ===\n";
$certPath = realpath(__DIR__ . '/../../certificates/root.crt');
echo "Certificate path: " . ($certPath ?: 'not found') . "\n";
echo "Certificate exists: " . ($certPath && file_exists($certPath) ? 'YES' : 'NO') . "\n";

if ($certPath && file_exists($certPath)) {
    echo "Certificate readable: " . (is_readable($certPath) ? 'YES' : 'NO') . "\n";
    echo "Certificate size: " . filesize($certPath) . " bytes\n";
}

echo "\n=== Testing Database Connection ===\n";

try {
    // Database connection parameters - use environment variables in production
    $host = getenv('DB_HOST') ?: 'aws-0-ap-southeast-1.pooler.supabase.com';
    $port = getenv('DB_PORT') ?: '5432';
    $dbname = getenv('DB_NAME') ?: 'postgres';
    $user = getenv('DB_USER') ?: 'postgres.yigklskjcbgfnxklhwir';
    $password = getenv('DB_PASSWORD') ?: '1rN7Wq8WOwGnZtIL';
    
    echo "Using host: $host\n";
    echo "Using port: $port\n";
    echo "Using database: $dbname\n";
    echo "Using user: $user\n";
    
    // Check if we're in a local environment (has certificate file)
    $certPath = realpath(__DIR__ . '/../../certificates/root.crt');
    $isLocal = $certPath && file_exists($certPath);
    
    if ($isLocal) {
        echo "Environment: LOCAL (with SSL certificate)\n";
        putenv("PGSSLMODE=verify-ca");
        putenv("PGSSLROOTCERT=$certPath");
    } else {
        echo "Environment: PRODUCTION (without certificate)\n";
        putenv("PGSSLMODE=require");
    }

    // Construct DSN
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    echo "DSN: $dsn\n";
    
    // Create PDO connection with appropriate options
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 30
    ];

    echo "Attempting connection...\n";
    $pdo = new PDO($dsn, $user, $password, $options);
    
    echo "Connection successful!\n";
    echo "Connection object type: " . get_class($pdo) . "\n";
    
    // Test a simple query
    try {
        $stmt = $pdo->query("SELECT version()");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Database version: " . $result['version'] . "\n";
    } catch (Exception $e) {
        echo "Query test failed: " . $e->getMessage() . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database connection error (PDO): " . $e->getMessage() . "\n";
    echo "PDO Error Code: " . $e->getCode() . "\n";
    echo "PDO Error Info: " . print_r($e->errorInfo, true) . "\n";
} catch (Exception $e) {
    echo "General connection error: " . $e->getMessage() . "\n";
}

echo "\n=== End Debug Info ===\n";
?>
