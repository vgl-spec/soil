<?php
// filepath: c:\xampp\htdocs\soil\app\API\debug_db.php
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== DEBUG DB CONNECTION ===\n";

echo "Working dir: " . getcwd() . "\n";
echo "Script dir: " . __DIR__ . "\n\n";

// Environment variables
$envs = ['DB_HOST','DB_PORT','DB_NAME','DB_USER','DB_PASSWORD','PGSSLMODE','PGSSLROOTCERT'];
foreach ($envs as $e) {
    $val = getenv($e);
    echo "$e: " . ($val !== false ? $val : 'not set') . "\n";
}
echo "\n";

// SSL certificate check
$cert = realpath(__DIR__ . '/../../certificates/root.crt');
echo "Cert path: " . ($cert ?: 'not found') . "\n";
echo "Cert exists: " . (file_exists($cert) ? 'YES' : 'NO') . "\n";
if (file_exists($cert)) {
    echo "Cert readable: " . (is_readable($cert) ? 'YES' : 'NO') . "\n";
    echo "Cert size: " . filesize($cert) . " bytes\n";
}
echo "\n";

// PDO drivers
$drv = PDO::getAvailableDrivers();
echo "Available PDO drivers: " . implode(', ', $drv) . "\n";
echo "pgsql driver loaded: " . (in_array('pgsql', $drv) ? 'YES' : 'NO') . "\n\n";

// Construct DSN and attempt connection
$host = getenv('DB_HOST') ?: 'aws-0-ap-southeast-1.pooler.supabase.com';
$port = getenv('DB_PORT') ?: '5432';
$db   = getenv('DB_NAME') ?: 'postgres';
$user = getenv('DB_USER') ?: 'postgres.yigklskjcbgfnxklhwir';
$pass = getenv('DB_PASSWORD') ?: '1rN7Wq8WOwGnZtIL';
$dsn  = "pgsql:host={$host};port={$port};dbname={$db}";

echo "Constructed DSN: $dsn\n";

try {
    $opts = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10
    ];
    $pdo = new PDO($dsn, $user, $pass, $opts);
    echo "Connection established successfully.\n";
    $ver = $pdo->query('SELECT version()')->fetch(PDO::FETCH_ASSOC);
    echo "Database version: " . ($ver['version'] ?? 'unknown') . "\n";
} catch (PDOException $e) {
    echo "Connection failed:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
    echo "Error Info: " . print_r($e->errorInfo, true) . "\n";
}

// Show last 10 lines of PHP error log
$log = __DIR__ . '/../../php_errors.log';
echo "\n=== PHP ERROR LOG ===\n";
if (file_exists($log)) {
    $lines = file($log, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $tail = array_slice($lines, -10);
    foreach ($tail as $l) {
        echo $l . "\n";
    }
} else {
    echo "No error log at $log\n";
}
