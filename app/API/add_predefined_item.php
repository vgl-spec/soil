<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

$data = json_decode(file_get_contents("php://input"), true);

$main_category_id = $data['main_category_id'] ?? null;
$subcat_id = $data['subcat_id'] ?? null;
$name = $data['name'] ?? null;
$unit = $data['unit'] ?? 'kg';    if (!$main_category_id || !$subcat_id || !$name) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    error_log("Adding predefined item: main_category_id=$main_category_id, subcat_id=$subcat_id, name=$name, unit=$unit");

// Check if item already exists
$checkQuery = "SELECT id FROM predefined_items WHERE main_category_id = ? AND subcat_id = ? AND name = ?";
$stmt = $conn->prepare($checkQuery);
$stmt->execute([$main_category_id, $subcat_id, $name]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode(['success' => false, 'message' => 'Predefined item already exists']);
    exit;
}

// Insert new predefined item
$insertQuery = "INSERT INTO predefined_items (main_category_id, subcat_id, name, unit) VALUES (?, ?, ?, ?) RETURNING id";
$stmt = $conn->prepare($insertQuery);
$stmt->execute([$main_category_id, $subcat_id, $name, $unit]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);    if ($row) {
        error_log("Successfully added predefined item with ID: " . $row['id']);
        echo json_encode(['success' => true, 'id' => (int)$row['id']]);
    } else {
        throw new Exception('Failed to insert predefined item');
    }

} catch (Exception $e) {
    error_log("API Error in add_predefined_item.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>