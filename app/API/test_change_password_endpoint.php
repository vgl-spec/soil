<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';

// Test endpoint for change password debugging
error_log("Test change password endpoint called");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    error_log("Received test data: " . print_r($inputData, true));
    
    echo json_encode([
        'success' => true,
        'message' => 'Test endpoint working',
        'received_data' => [
            'user_id' => $inputData['user_id'] ?? 'missing',
            'has_current_password' => !empty($inputData['current_password']),
            'has_new_password' => !empty($inputData['new_password']),
            'database_connected' => $conn ? true : false
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
?>
