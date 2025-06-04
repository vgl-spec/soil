<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$main_category_id = $data['main_category_id'] ?? null;
$subcat_id = $data['subcat_id'] ?? null;
$name = $data['name'] ?? null;
$unit = $data['unit'] ?? 'kg';

if (!$main_category_id || !$subcat_id || !$name) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Check if item already exists
$checkQuery = "SELECT id FROM predefined_items WHERE main_category_id = ? AND subcat_id = ? AND name = ?";
$stmt = $conn->prepare($checkQuery);
$stmt->bind_param("iis", $main_category_id, $subcat_id, $name);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Predefined item already exists']);
    exit;
}
$stmt->close();

// Insert new predefined item
$insertQuery = "INSERT INTO predefined_items (main_category_id, subcat_id, name, unit) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($insertQuery);
$stmt->bind_param("iiss", $main_category_id, $subcat_id, $name, $unit);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
?>