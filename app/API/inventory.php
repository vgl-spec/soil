<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $stmt = $conn->query("SELECT i.id, pi.name, pi.unit, i.quantity, 
                         CASE 
                           WHEN i.harvest_date IS NULL OR i.harvest_date = '0001-01-01' THEN NULL 
                           ELSE i.harvest_date::date 
                         END AS harvest_date
                       FROM items i
                       JOIN predefined_items pi ON i.predefined_item_id = pi.id");
  $items = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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