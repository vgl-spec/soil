<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');

// Load environment variables from .env file
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

// Set SSL certificate path and mode
$sslCertPath = realpath(__DIR__ . '/../../certificates/root.crt');
if (!$sslCertPath) {
    error_log("SSL certificate not found at: " . __DIR__ . '/../../certificates/root.crt');
    die("SSL certificate not found");
}
error_log("Using SSL certificate: " . $sslCertPath);

// Direct database parameters
$host = 'aws-0-ap-southeast-1.pooler.supabase.com';
$port = 5432;
$dbname = 'postgres';
$user = 'postgres.yigklskjcbgfnxklhwir';
$pass = '1rN7Wq8WOwGnZtIL';

// Build DSN with session pooler settings
$dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require;options='--application-name=soil_inventory --client-min-messages=warning'";

try {
    error_log("Attempting connection to: {$host}:{$port}");
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    error_log("Connection error: " . $e->getMessage());
    die('Postgres connection failed: ' . $e->getMessage());
}
