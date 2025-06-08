<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getDBConnection() {
    try {
        $certPath = realpath(__DIR__ . '/../../certificates/root.crt');
        
        // Database connection parameters
        $host = 'aws-0-ap-southeast-1.pooler.supabase.com';
        $port = '5432';
        $dbname = 'postgres';
        $user = 'postgres.yigklskjcbgfnxklhwir';
        $password = '1rN7Wq8WOwGnZtIL';

        // Set SSL mode environment variables
        putenv("PGSSLMODE=verify-full");
        putenv("PGSSLROOTCERT=$certPath");

        // Construct DSN with SSL parameters
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        
        // Create PDO connection
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_PERSISTENT => true // Enable persistent connections for better performance
        ]);

        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}

// Initialize and export the connection
$conn = getDBConnection();
