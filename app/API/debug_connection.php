<?php
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Debug Connection Test ===\n";
echo "Current working directory: " . getcwd() . "\n";
echo "Script directory: " . __DIR__ . "\n";

// Check certificate path
$certPath = realpath(__DIR__ . '/../../certificates/root.crt');
echo "Certificate path: " . $certPath . "\n";
echo "Certificate exists: " . (file_exists($certPath) ? 'YES' : 'NO') . "\n";

if (file_exists($certPath)) {
    echo "Certificate readable: " . (is_readable($certPath) ? 'YES' : 'NO') . "\n";
    echo "Certificate size: " . filesize($certPath) . " bytes\n";
}

echo "\n=== Environment Variables ===\n";
echo "PGSSLMODE: " . (getenv('PGSSLMODE') ?: 'not set') . "\n";
echo "PGSSLROOTCERT: " . (getenv('PGSSLROOTCERT') ?: 'not set') . "\n";

echo "\n=== PDO Drivers ===\n";
$drivers = PDO::getAvailableDrivers();
echo "Available drivers: " . implode(', ', $drivers) . "\n";
echo "PostgreSQL driver available: " . (in_array('pgsql', $drivers) ? 'YES' : 'NO') . "\n";

echo "\n=== Testing Connection ===\n";

include 'db.php';

if ($conn) {
    echo "Connection successful!\n";
    echo "Connection object type: " . get_class($conn) . "\n";
    
    try {
        $stmt = $conn->query("SELECT version()");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Database version: " . $result['version'] . "\n";
    } catch (Exception $e) {
        echo "Query test failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "Connection failed!\n";
    echo "Connection variable: " . var_export($conn, true) . "\n";
}

echo "\n=== Error Log (last 10 lines) ===\n";
$logFile = __DIR__ . '/../../php_errors.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $lastLines = array_slice($lines, -10);
    foreach ($lastLines as $line) {
        echo $line;
    }
} else {
    echo "Error log file not found at: $logFile\n";
}
?>
