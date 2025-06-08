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
$checkQuery = "SELECT id FROM predefined_items WHERE main_category_id = $1 AND subcat_id = $2 AND name = $3";
$stmt = $conn->prepare($checkQuery);
$result = $stmt->execute([$main_category_id, $subcat_id, $name]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode(['success' => false, 'message' => 'Predefined item already exists']);
    exit;
}

// Insert new predefined item
$insertQuery = "INSERT INTO predefined_items (main_category_id, subcat_id, name, unit) VALUES ($1, $2, $3, $4) RETURNING id";
$stmt = $conn->prepare($insertQuery);
$result = $stmt->execute([$main_category_id, $subcat_id, $name, $unit]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode(['success' => true, 'id' => $row['id']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to insert item']);
}
?>