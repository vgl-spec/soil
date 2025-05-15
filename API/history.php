<?php
require_once "db.php"; // Connect to the database

header("Content-Type: application/json");

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
