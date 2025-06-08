<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');

function configureSslCertificate() {
    $certDir = str_replace('\\', '/', __DIR__ . '/../../certificates');
    $sslCertPath = $certDir . '/root.crt';
    
    error_log("Checking SSL configuration:");
    error_log("Certificate directory: " . $certDir);
    error_log("Certificate path: " . $sslCertPath);

    if (!is_dir($certDir)) {
        error_log("Certificate directory not found: " . $certDir);
        return false;
    }

    if (!file_exists($sslCertPath)) {
        error_log("SSL certificate not found at: " . $sslCertPath);
        return false;
    }

    if (!is_readable($sslCertPath)) {
        error_log("SSL certificate is not readable at: " . $sslCertPath);
        return false;
    }

    // Set both environment variables and PHP global variables
    $_ENV['PGSSLMODE'] = 'prefer';
    $_ENV['PGSSLROOTCERT'] = $sslCertPath;
    putenv('PGSSLMODE=prefer');
    putenv('PGSSLROOTCERT=' . $sslCertPath);
    
    error_log("SSL configuration successful");
    return $sslCertPath;
}

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

// Configure SSL
$sslCertPath = configureSslCertificate();
if ($sslCertPath === false) {
    die("SSL certificate configuration failed");
}

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
