<?php
// Test script to check action_logs table structure and test insertion
require_once 'app/API/db.php';

try {
    // Check table structure (PostgreSQL syntax)
    echo "<h2>Action Logs Table Structure:</h2>";
    $stmt = $conn->query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'action_logs' ORDER BY ordinal_position");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($columns);
    echo "</pre>";
    
    // Test inserting a record (same format as reduce_stock.php)
    echo "<h2>Testing Insert (same as reduce_stock.php):</h2>";
    $stmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $result = $stmt->execute([1, 'delete_item', 'Test deletion from test script']);
    
    if ($result) {
        echo "✅ Insert successful!<br>";
        echo "Affected rows: " . $stmt->rowCount() . "<br>";
    } else {
        echo "❌ Insert failed!<br>";
        echo "Error info: " . json_encode($stmt->errorInfo()) . "<br>";
    }
    
    // Show recent entries
    echo "<h2>Recent Action Logs:</h2>";
    $stmt = $conn->query("SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT 10");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($logs);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
