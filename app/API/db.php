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
        }
    }
}

// Get database URL from environment variable
$databaseUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
error_log("Database URL: " . preg_replace('/postgresql:\/\/[^:]+:[^@]+@/', 'postgresql://user:pass@', $databaseUrl));

// Parse the URI
$dbopts = parse_url($databaseUrl);
$host   = $dbopts['host'];
$port   = 5432; // Use session pooler port
$user   = $dbopts['user'];
$pass   = $dbopts['pass'];
$dbname = ltrim($dbopts['path'], '/');

// Build DSN and connect with pooler settings
$dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require;options='--client-min-messages=warning';application_name='soil_inventory';pgbouncer=session";

try {
    error_log("Attempting connection to: {$host}:{$port}");
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    error_log("Connection error: " . $e->getMessage());
    die('Postgres connection failed: ' . $e->getMessage());
}
