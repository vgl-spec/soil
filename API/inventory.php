<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
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