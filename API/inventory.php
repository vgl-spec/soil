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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $result = $conn->query("SELECT i.id, pi.name, pi.unit, i.quantity, i.harvest_date
                          FROM items i
                          JOIN predefined_items pi ON i.predefined_item_id = pi.id");
  $items = [];
  while ($row = $result->fetch_assoc()) {
    $items[] = $row;
  }
  echo json_encode($items);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $stmt = $conn->prepare("INSERT INTO items (predefined_item_id, quantity, harvest_date) VALUES (?, ?, ?)");
  $stmt->bind_param("iis", $data['predefined_item_id'], $data['quantity'], $data['harvest_date']);
  $stmt->execute();
  echo json_encode(["id" => $stmt->insert_id]);
}
?>