<?php
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Simple test query
    $query = "SELECT COUNT(*) as count FROM items";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $historyQuery = "SELECT COUNT(*) as count FROM item_history";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->execute();
    $historyResult = $historyStmt->fetch(PDO::FETCH_ASSOC);

    // Clean any output buffer
    if (ob_get_level()) {
        ob_clean();
    }

    echo json_encode([
        "success" => true,
        "items_count" => (int)$result['count'],
        "history_count" => (int)$historyResult['count'],
        "message" => "Database connection and queries working"
    ]);

} catch (Exception $e) {
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("Test items error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
