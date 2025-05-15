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