<?php
// Production server compatibility check and database connection
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');

echo "=== PRODUCTION DATABASE DIAGNOSTIC ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "Server: " . $_SERVER['HTTP_HOST'] . "\n";

// Check available PDO drivers
echo "\nAvailable PDO drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";

// Check PostgreSQL extension specifically
echo "PostgreSQL extension loaded: " . (extension_loaded('pdo_pgsql') ? 'YES' : 'NO') . "\n";
echo "PDO extension loaded: " . (extension_loaded('pdo') ? 'YES' : 'NO') . "\n";

// Check if we can load PostgreSQL extension dynamically
if (!extension_loaded('pdo_pgsql')) {
    echo "\nAttempting to load pdo_pgsql extension...\n";
    if (function_exists('dl')) {
        try {
            dl('pdo_pgsql.so');
            echo "Successfully loaded pdo_pgsql extension\n";
        } catch (Exception $e) {
            echo "Failed to load pdo_pgsql extension: " . $e->getMessage() . "\n";
        }
    } else {
        echo "dl() function not available\n";
    }
}

// Check environment variables
echo "\n=== ENVIRONMENT VARIABLES ===\n";
$envVars = ['DATABASE_URL', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
foreach ($envVars as $var) {
    $value = getenv($var);
    echo "$var: " . ($value ? (strlen($value) > 50 ? substr($value, 0, 50) . '...' : $value) : 'Not set') . "\n";
}

// Check if we have hardcoded database credentials as fallback
echo "\n=== ATTEMPTING DATABASE CONNECTION ===\n";

try {
    // Try with environment variables first
    $databaseUrl = getenv('DATABASE_URL');
    if ($databaseUrl) {
        echo "Found DATABASE_URL environment variable\n";
        $parsedUrl = parse_url($databaseUrl);
        $host = $parsedUrl['host'];
        $port = $parsedUrl['port'] ?? 5432;
        $dbname = ltrim($parsedUrl['path'], '/');
        $user = $parsedUrl['user'];
        $password = $parsedUrl['pass'];
        echo "Parsed: host=$host, port=$port, dbname=$dbname, user=$user\n";
    } else {
        echo "No DATABASE_URL found, using hardcoded Supabase credentials\n";
        // Fallback to hardcoded credentials
        $host = 'aws-0-ap-southeast-1.pooler.supabase.com';
        $port = '5432';
        $dbname = 'postgres';
        $user = 'postgres.yigklskjcbgfnxklhwir';
        $password = '1rN7Wq8WOwGnZtIL';
    }

    if (in_array('pgsql', PDO::getAvailableDrivers())) {
        echo "PostgreSQL driver available, attempting connection...\n";
        
        // Try without SSL first (for production environments)
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
        echo "DSN: $dsn\n";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 30
        ];
        
        $pdo = new PDO($dsn, $user, $password, $options);
        echo "✅ DATABASE CONNECTION SUCCESSFUL!\n";
        
        // Test a simple query
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch();
        echo "Test query result: " . json_encode($result) . "\n";
        
        // Check users table
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as user_count FROM users");
            $result = $stmt->fetch();
            echo "Users in database: " . $result['user_count'] . "\n";
        } catch (Exception $e) {
            echo "Error checking users table: " . $e->getMessage() . "\n";
        }
        
    } else {
        echo "❌ PostgreSQL driver NOT available\n";
        echo "This server cannot connect to PostgreSQL databases\n";
        echo "Available drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ DATABASE CONNECTION FAILED: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
}

echo "\n=== END DIAGNOSTIC ===\n";
?>
