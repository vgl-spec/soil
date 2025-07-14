<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');

include 'db.php';

// Get JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$main_category_id = $data['main_category_id'] ?? null;
$name = $data['name'] ?? null;
$label = $data['label'] ?? null;
$unit = $data['unit'] ?? 'kg';

// Validate required fields
if (!$main_category_id || !$name || !$label) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields: main_category_id, name, label']);
    exit;
}

try {
    // First, fix the sequence to ensure it's synchronized with the current max ID
    $resetSeqQuery = "SELECT setval('subcategories_id_seq', COALESCE((SELECT MAX(id) FROM subcategories), 0) + 1, false)";
    $conn->exec($resetSeqQuery);

    // Check if subcategory with the same name already exists for this category
    $checkStmt = $conn->prepare("SELECT id FROM subcategories WHERE category_id = ? AND name = ?");
    $checkStmt->execute([$main_category_id, $name]);
    if ($checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Subcategory with this name already exists in this category']);
        exit;
    }

    // Insert new subcategory (let the database auto-generate the ID)
    $stmt = $conn->prepare("INSERT INTO subcategories (category_id, name, label, unit) VALUES (?, ?, ?, ?) RETURNING id");
    $stmt->execute([$main_category_id, $name, $label, $unit]);
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && isset($row['id'])) {
        echo json_encode([
            'success' => true, 
            'id' => (int)$row['id'],
            'message' => 'Subcategory added successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to insert subcategory - no ID returned']);
    }

} catch (PDOException $e) {
    error_log("Database error in add_subcategory.php: " . $e->getMessage());
    
    // Check if it's a duplicate key error
    if (strpos($e->getMessage(), 'duplicate key') !== false || strpos($e->getMessage(), 'Unique violation') !== false) {
        echo json_encode(['success' => false, 'message' => 'Subcategory already exists or database sequence error. Please try again.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} catch (Exception $e) {
    error_log("General error in add_subcategory.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>