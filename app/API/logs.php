<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['https://soil-indol.vercel.app'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['https://soil-indol.vercel.app']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with 200 OK and exit early for preflight
    http_response_code(200);
    exit();
}

include 'db.php';
session_start();

$user_id = $_GET['user_id'] ?? null;
$logs = [];

if ($user_id) {
  $stmt = $conn->prepare("SELECT * FROM action_logs WHERE user_id = ? ORDER BY timestamp DESC");
  $stmt->bind_param("i", $user_id);
  $stmt->execute();
  $result = $stmt->get_result();

  while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
  }
} else {
  $result = $conn->query("SELECT * FROM action_logs ORDER BY timestamp DESC");
  while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
  }
}

echo json_encode($logs);
?>