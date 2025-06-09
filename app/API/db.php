<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getDBConnection() {
    try {
        // Check if PostgreSQL PDO driver is available
        if (!in_array('pgsql', PDO::getAvailableDrivers())) {
            error_log("PostgreSQL PDO driver not available. Available drivers: " . implode(', ', PDO::getAvailableDrivers()));
            throw new Exception("PostgreSQL PDO driver not installed on this server");
        }
        
        // Database connection parameters - use environment variables in production
        $host = getenv('DB_HOST') ?: 'aws-0-ap-southeast-1.pooler.supabase.com';
        $port = getenv('DB_PORT') ?: '5432';
        $dbname = getenv('DB_NAME') ?: 'postgres';
        $user = getenv('DB_USER') ?: 'postgres.yigklskjcbgfnxklhwir';
        $password = getenv('DB_PASSWORD') ?: '1rN7Wq8WOwGnZtIL';
        
        // Check if we're in a local environment (has certificate file)
        $certPath = realpath(__DIR__ . '/../../certificates/root.crt');
        $isLocal = $certPath && file_exists($certPath);
        
        if ($isLocal) {
            error_log("Local environment with SSL certificate");
            // Local environment - use SSL certificate
            putenv("PGSSLMODE=verify-ca");
            putenv("PGSSLROOTCERT=$certPath");
        } else {
            error_log("Production environment - using require SSL mode");
            // Production environment - use require SSL without certificate verification
            putenv("PGSSLMODE=require");
        }

        // Construct DSN
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        
        error_log("Attempting connection with DSN: " . $dsn);
        
        // Create PDO connection with appropriate options
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 30
        ];

        $pdo = new PDO($dsn, $user, $password, $options);
        
        error_log("Database connection successful");
        return $pdo;
        
    } catch (PDOException $e) {
        error_log("Database connection error (PDO): " . $e->getMessage());
        error_log("PDO Error Code: " . $e->getCode());
        error_log("PDO Error Info: " . print_r($e->errorInfo, true));
        return null;
    } catch (Exception $e) {
        error_log("General connection error: " . $e->getMessage());
        return null;
    }
}

// Initialize connection
$conn = null;  // Initialize as global variable
try {
    $conn = getDBConnection();
    if (!$conn) {
        error_log("Failed to initialize database connection - getDBConnection returned null");
    } else {
        error_log("Database connection initialized successfully in db.php");
    }
} catch (Exception $e) {
    error_log("Connection initialization error: " . $e->getMessage());
    $conn = null;
}
?>