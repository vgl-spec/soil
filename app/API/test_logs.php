<?php
// Simple test for logs endpoint
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }
    
    // Test query to check if action_logs table exists and has data
    $stmt = $conn->query("SELECT COUNT(*) as count FROM action_logs");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // If no data, let's create some sample data
    if ($count == 0) {
        // Insert some sample log entries
        $sampleLogs = [
            ['user_id' => 1, 'action_type' => 'login', 'description' => 'User logged in'],
            ['user_id' => 1, 'action_type' => 'add_item', 'description' => 'Added new item to inventory'],
            ['user_id' => 1, 'action_type' => 'increase_stock', 'description' => 'Increased stock for item'],
            ['user_id' => 1, 'action_type' => 'reduce_stock', 'description' => 'Reduced stock for item'],
            ['user_id' => 1, 'action_type' => 'view_report', 'description' => 'Generated inventory report'],
        ];
        
        foreach ($sampleLogs as $log) {
            $stmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$log['user_id'], $log['action_type'], $log['description']]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Sample logs created',
            'count' => count($sampleLogs)
        ]);
    } else {
        // Return existing logs
        $stmt = $conn->query("SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT 10");
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Existing logs found',
            'count' => $count,
            'sample_logs' => $logs
        ]);
    }
    
} catch (Exception $e) {
    error_log("Test logs error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
