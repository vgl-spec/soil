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

// Configure SSL settings
$sslCertPath = __DIR__ . '/../../certificates/root.crt';

// Validate SSL certificate
if (!file_exists($sslCertPath)) {
    error_log("SSL certificate not found at: " . $sslCertPath);
    die("SSL certificate not found");
}

if (!is_readable($sslCertPath)) {
    error_log("SSL certificate is not readable at: " . $sslCertPath);
    die("SSL certificate is not readable");
}

// Set PostgreSQL SSL environment variables
putenv('PGSSLMODE=verify-full');
putenv('PGSSLROOTCERT=' . $sslCertPath);

// Direct database parameters
$host = 'aws-0-ap-southeast-1.pooler.supabase.com';
$port = 5432;
$dbname = 'postgres';
$user = 'postgres.yigklskjcbgfnxklhwir';
$pass = '1rN7Wq8WOwGnZtIL';

// Build DSN with session pooler settings
$dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";

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
