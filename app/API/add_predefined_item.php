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

// Enhanced error logging
error_log("Raw input data: " . file_get_contents("php://input"));
error_log("Decoded data: " . print_r($data, true));

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

error_log("Processed values: main_category_id=$main_category_id, subcat_id=$subcat_id, name=$name, unit=$unit");

if (!$main_category_id || !$subcat_id || !$name) {
    $missingFields = [];
    if (!$main_category_id) $missingFields[] = 'main_category_id';
    if (!$subcat_id) $missingFields[] = 'subcat_id';
    if (!$name) $missingFields[] = 'name';
    
    error_log("Missing required fields: " . implode(', ', $missingFields));
    echo json_encode(['success' => false, 'message' => 'Missing required fields: ' . implode(', ', $missingFields)]);
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
    error_log("Invalid category or subcategory: main_category_id=$main_category_id, subcat_id=$subcat_id");
    
    // Let's check what exists separately for better error reporting
    $catCheck = $conn->prepare("SELECT id FROM categories WHERE id = ?");
    $catCheck->execute([$main_category_id]);
    $catExists = $catCheck->fetch();
    
    $subCheck = $conn->prepare("SELECT id, category_id FROM subcategories WHERE id = ?");
    $subCheck->execute([$subcat_id]);
    $subExists = $subCheck->fetch();
    
    $errorMsg = "Validation failed: ";
    if (!$catExists) {
        $errorMsg .= "Category ID $main_category_id does not exist. ";
    }
    if (!$subExists) {
        $errorMsg .= "Subcategory ID $subcat_id does not exist. ";
    } elseif ($subExists['category_id'] != $main_category_id) {
        $errorMsg .= "Subcategory ID $subcat_id does not belong to category ID $main_category_id (belongs to {$subExists['category_id']}). ";
    }
    
    error_log($errorMsg);
    echo json_encode(['success' => false, 'message' => $errorMsg]);
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
        error_log("Detected sequence issue - attempting to fix...");
        
        // Try to fix the sequence automatically
        try {
            $maxIdQuery = "SELECT MAX(id) as max_id FROM predefined_items";
            $maxStmt = $conn->query($maxIdQuery);
            $maxResult = $maxStmt->fetch(PDO::FETCH_ASSOC);
            $maxId = $maxResult['max_id'] ?? 0;
            
            $newSeqValue = $maxId + 1;
            $resetQuery = "SELECT setval('predefined_items_id_seq', $newSeqValue, false)";
            $conn->query($resetQuery);
            
            error_log("Sequence reset to: $newSeqValue");
            
            // Try the insert again
            $result = $stmt->execute([$main_category_id, $subcat_id, $name, $unit]);
            
            if ($result) {
                error_log("Insert successful after sequence fix");
            } else {
                throw new Exception('Insert failed even after sequence fix: ' . print_r($stmt->errorInfo(), true));
            }
        } catch (Exception $seqError) {
            error_log("Failed to fix sequence: " . $seqError->getMessage());
            throw new Exception('Database sequence error. Please contact administrator. Error: ' . $errorInfo[2]);
        }
    } else {
        throw new Exception('Failed to execute insert query: ' . $errorInfo[2]);
    }
}

$lastId = $conn->lastInsertId();

if ($lastId) {
        error_log("Successfully added predefined item with ID: " . $lastId);
        echo json_encode(['success' => true, 'id' => (int)$lastId]);
    } else {
        // If lastInsertId returns something falsy (e.g., 0 if the table doesn't have auto-increment or "00000" for some drivers when no rows affected)
        // but the execute was successful, it might indicate a different issue or configuration.
        // However, for typical auto-increment PKs, a truthy value is expected.
        error_log("Failed to retrieve lastInsertId after successful insert. MainCategoryID: $main_category_id, SubcatID: $subcat_id, Name: $name");
        throw new Exception('Failed to retrieve ID for predefined item after insert.');
    }

} catch (Exception $e) {
    error_log("API Error in add_predefined_item.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>