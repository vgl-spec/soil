<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    exit(0);
}

header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

session_start();
include 'db.php';


$user_id = $_GET['user_id'] ?? null;
$logs = [];

if ($user_id) {
  $stmt = $conn->prepare("SELECT * FROM action_logs WHERE user_id = $1 ORDER BY timestamp DESC");
  $stmt->execute([$user_id]);
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $logs[] = $row;
  }
} else {
  $stmt = $conn->query("SELECT * FROM action_logs ORDER BY timestamp DESC");
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $logs[] = $row;
  }
}

echo json_encode($logs);
?>