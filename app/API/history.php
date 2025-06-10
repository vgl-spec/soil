<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

require_once "db.php"; // Connect to the database

try {
    // Fetch recent action logs (you can add filtering here later)
    $stmt = $conn->prepare("SELECT * FROM action_logs ORDER BY timestamp DESC");
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $logs
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
