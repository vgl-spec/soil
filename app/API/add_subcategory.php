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

$data = json_decode(file_get_contents("php://input"), true);

$main_category_id = $data['main_category_id'] ?? null;
$name = $data['name'] ?? null;
$label = $data['label'] ?? null;
$unit = $data['unit'] ?? 'Kgs';

if (!$main_category_id || !$name || !$label) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// FIX: Use the correct table and column names
$stmt = $conn->prepare("INSERT INTO subcategories (category_id, name, label, unit) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $main_category_id, $name, $label, $unit);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}
?>