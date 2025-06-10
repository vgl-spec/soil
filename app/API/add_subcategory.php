<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$main_category_id = $data['main_category_id'] ?? null;
$name = $data['name'] ?? null;
$label = $data['label'] ?? null;
$unit = $data['unit'] ?? 'Kgs';

if (!$main_category_id || !$name || !$label) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Use the correct table and column names with PostgreSQL syntax
$stmt = $conn->prepare("INSERT INTO subcategories (category_id, name, label, unit) VALUES ($1, $2, $3, $4) RETURNING id");
$result = $stmt->execute([$main_category_id, $name, $label, $unit]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode(['success' => true, 'id' => $row['id']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to insert subcategory']);
}
?>