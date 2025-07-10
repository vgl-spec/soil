<?php
// Simple test version of items.php for debugging CORS
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

try {
    // Test response without database
    $testResponse = [
        "items" => [
            [
                "id" => 1,
                "name" => "Test Item",
                "quantity" => 10,
                "unit" => "kg"
            ]
        ],
        "history" => [
            [
                "id" => 1,
                "name" => "Test History",
                "quantity" => 5,
                "changeType" => "increase",
                "date" => date('Y-m-d H:i:s')
            ]
        ],
        "cors_test" => true,
        "timestamp" => date('Y-m-d H:i:s'),
        "origin" => $_SERVER['HTTP_ORIGIN'] ?? 'no origin header'
    ];

    echo json_encode($testResponse);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

exit;
?>
