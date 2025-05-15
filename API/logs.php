<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    exit(0);
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

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