<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...\n";

include 'db.php';

if ($conn) {
    echo "Connection successful!\n";
    echo "Connection object type: " . get_class($conn) . "\n";
    
    // Test a simple query
    try {
        $stmt = $conn->query("SELECT 1 as test");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Test query result: " . json_encode($result) . "\n";
    } catch (Exception $e) {
        echo "Query test failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "Connection failed!\n";
    echo "Connection variable is: " . var_export($conn, true) . "\n";
}
?>
