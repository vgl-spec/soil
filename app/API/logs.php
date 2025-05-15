<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
$allowedOrigins = ['https://soil-indol.vercel.app'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if the origin matches
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS preflight request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // Respond with 200 OK for preflight
    exit();
}
session_start();
include 'db.php';


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