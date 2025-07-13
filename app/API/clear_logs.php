<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Read input
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    
    $user_id = $data['user_id'] ?? null;
    $confirm = $data['confirm'] ?? false;

    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        exit;
    }

    if (!$confirm) {
        echo json_encode(["success" => false, "message" => "Confirmation is required"]);
        exit;
    }

    // Get count of logs before deletion for logging
    $countQuery = "SELECT COUNT(*) as count FROM action_logs";
    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute();
    $logCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Start transaction
    $conn->beginTransaction();

    try {
        // Clear all action logs
        $deleteQuery = "DELETE FROM action_logs";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteResult = $deleteStmt->execute();

        if (!$deleteResult) {
            throw new Exception('Failed to clear logs');
        }

        // Log the clear logs action (after clearing, so this will be the first entry)
        $logStmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        $logResult = $logStmt->execute([
            $user_id,
            'clear_logs',
            "Cleared all action logs (deleted $logCount records)"
        ]);

        if (!$logResult) {
            throw new Exception('Failed to log clear action');
        }

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => "Successfully cleared $logCount log records",
            'deleted_count' => $logCount
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log("API Error in clear_logs.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
