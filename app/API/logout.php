<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

// Suppress HTML errors and enable logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
error_reporting(E_ALL);

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Include the database connection file
require_once __DIR__ . '/db.php';

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Read input
$rawInput = file_get_contents("php://input");
error_log("Logout raw input received: " . $rawInput);

// Check if the input is empty
if (empty($rawInput)) {
    echo json_encode(["success" => false, "message" => "No input received"]);
    exit;
}

// Decode JSON input
$data = json_decode($rawInput, true);
if (!$data) {
    error_log("JSON decoding failed for logout.");
    echo json_encode(["success" => false, "message" => "Invalid JSON", "raw_input" => $rawInput]);
    exit;
}

$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Missing user ID"]);
    exit;
}

try {
    // Log the logout action (same format as delete_predefined_item.php)
    error_log("Attempting to log logout for user_id: " . $user_id);
    $logStmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $logResult = $logStmt->execute([
        $user_id,
        'logout',
        'User logged out'
    ]);
    error_log("Logout log result: " . ($logResult ? 'SUCCESS' : 'FAILED'));
    if (!$logResult) {
        error_log("Log error info: " . json_encode($logStmt->errorInfo()));
    }

    // Clear session
    session_destroy();

    echo json_encode(["success" => true, "message" => "Logged out successfully"]);

} catch (PDOException $e) {
    error_log("Database error in logout.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
} catch (Exception $e) {
    error_log("General error in logout.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "An error occurred"]);
}
?>
