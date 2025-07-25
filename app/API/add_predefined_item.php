<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // First, let's fix any existing predefined_items that have null main_category_id
    $fixQuery = "
        UPDATE predefined_items 
        SET main_category_id = (
            SELECT category_id 
            FROM subcategories 
            WHERE subcategories.id = predefined_items.subcat_id
        )
        WHERE main_category_id IS NULL AND subcat_id IS NOT NULL
    ";
    
    try {
        $conn->exec($fixQuery);
        error_log("Fixed existing predefined_items with null main_category_id");
    } catch (Exception $e) {
        error_log("Warning: Could not fix existing predefined_items: " . $e->getMessage());
    }

$data = json_decode(file_get_contents("php://input"), true);

$main_category_id = $data['main_category_id'] ?? null;
$subcat_id = $data['subcat_id'] ?? null;
$name = $data['name'] ?? null;
$unit = $data['unit'] ?? 'kg';

// Convert to integers if they're strings
if ($main_category_id !== null) {
    $main_category_id = (int)$main_category_id;
}
if ($subcat_id !== null) {
    $subcat_id = (int)$subcat_id;
}

if (!$main_category_id || !$subcat_id || !$name) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

    error_log("Adding predefined item: main_category_id=$main_category_id, subcat_id=$subcat_id, name=$name, unit=$unit");

// Validate that the category and subcategory exist
$validateQuery = "SELECT c.id as cat_id, s.id as subcat_id 
                  FROM categories c 
                  LEFT JOIN subcategories s ON c.id = s.category_id 
                  WHERE c.id = ? AND s.id = ?";
$validateStmt = $conn->prepare($validateQuery);
$validateStmt->execute([$main_category_id, $subcat_id]);
$validation = $validateStmt->fetch(PDO::FETCH_ASSOC);

if (!$validation) {
    echo json_encode(['success' => false, 'message' => 'Invalid category or subcategory']);
    exit;
}

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
$insertQuery = "INSERT INTO predefined_items (main_category_id, subcat_id, name, unit) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($insertQuery);
$result = $stmt->execute([$main_category_id, $subcat_id, $name, $unit]);

if (!$result) {
    $errorInfo = $stmt->errorInfo();
    error_log("SQL Error: " . print_r($errorInfo, true));
    
    // Check if it's a unique constraint violation (sequence issue)
    if (strpos($errorInfo[2], 'duplicate key value violates unique constraint') !== false) {
        // Try to fix the sequence automatically
        try {
            $maxIdQuery = "SELECT MAX(id) as max_id FROM predefined_items";
            $maxStmt = $conn->query($maxIdQuery);
            $maxResult = $maxStmt->fetch(PDO::FETCH_ASSOC);
            $maxId = $maxResult['max_id'] ?? 0;
            
            $newSeqValue = $maxId + 1;
            $resetQuery = "SELECT setval('predefined_items_id_seq', $newSeqValue, false)";
            $conn->query($resetQuery);
            
            // Try the insert again
            $result = $stmt->execute([$main_category_id, $subcat_id, $name, $unit]);
            
            if (!$result) {
                throw new Exception('Insert failed even after sequence fix');
            }
        } catch (Exception $seqError) {
            throw new Exception('Database sequence error. Please contact administrator.');
        }
    } else {
        throw new Exception('Failed to execute insert query: ' . $errorInfo[2]);
    }
}

$lastId = $conn->lastInsertId();

if ($lastId) {
    echo json_encode(['success' => true, 'id' => (int)$lastId]);
} else {
    throw new Exception('Failed to retrieve ID for predefined item after insert.');
}

} catch (Exception $e) {
    error_log("API Error in add_predefined_item.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>