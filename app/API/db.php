<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getDBConnection() {
    try {
        $certPath = realpath(__DIR__ . '/../../certificates/root.crt');
        if (!$certPath || !file_exists($certPath)) {
            throw new Exception("SSL certificate not found at: " . $certPath);
        }
        
        // Database connection parameters
        $host = 'aws-0-ap-southeast-1.pooler.supabase.com';
        $port = '5432';
        $dbname = 'postgres';
        $user = 'postgres.yigklskjcbgfnxklhwir';
        $password = '1rN7Wq8WOwGnZtIL';

        // Set SSL mode environment variables
        putenv("PGSSLMODE=verify-ca");  // Changed to verify-ca which is less strict than verify-full
        putenv("PGSSLROOTCERT=$certPath");

        // Construct DSN with SSL parameters
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        
        error_log("Attempting connection with DSN: " . $dsn);
        
        // Create PDO connection
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        error_log("Database connection successful");
        return $pdo;

    } catch (PDOException $e) {
        error_log("Database connection error (PDO): " . $e->getMessage());
        return null;
    }
}

// Initialize connection
try {
    $conn = getDBConnection();
    if (!$conn) {
        error_log("Failed to initialize database connection");
    }
} catch (Exception $e) {
    error_log("Connection initialization error: " . $e->getMessage());
    $conn = null;
}
