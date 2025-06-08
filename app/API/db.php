<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
ini_set('display_errors', 1);
error_reporting(E_ALL);

function configureSslCertificate() {
    $sslCertPath = str_replace('\\', '/', realpath(__DIR__ . '/../../certificates/root.crt'));
    
    error_log("Checking SSL configuration...");
    error_log("Certificate path: " . $sslCertPath);

    if (!$sslCertPath || !file_exists($sslCertPath)) {
        error_log("SSL certificate not found at: " . __DIR__ . '/../../certificates/root.crt');
        return false;
    }

    if (!is_readable($sslCertPath)) {
        error_log("SSL certificate is not readable at: " . $sslCertPath);
        return false;
    }

    $certContent = file_get_contents($sslCertPath);
    if (!$certContent || strpos($certContent, '-----BEGIN CERTIFICATE-----') === false) {
        error_log("Invalid certificate content at: " . $sslCertPath);
        return false;
    }    // Set SSL environment variables with strict verification
    putenv('PGSSLMODE=verify-full');
    putenv('PGSSLROOTCERT=' . $sslCertPath);
    $_ENV['PGSSLMODE'] = 'verify-full';
    $_ENV['PGSSLROOTCERT'] = $sslCertPath;
    
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

// Database connection parameters
$host = 'aws-0-ap-southeast-1.pooler.supabase.com';
$port = 5432;
$dbname = 'postgres';
$user = 'postgres.yigklskjcbgfnxklhwir';
$pass = '1rN7Wq8WOwGnZtIL';

// Build DSN string with enforced SSL
$dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=verify-full;sslrootcert={$sslCertPath}";

try {
    error_log("Attempting secure connection to: {$host}:{$port} with enforced SSL");
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    error_log("Database connection successful");
} catch (PDOException $e) {
    error_log("Connection error: " . $e->getMessage());
    die('Postgres connection failed: ' . $e->getMessage());
}
