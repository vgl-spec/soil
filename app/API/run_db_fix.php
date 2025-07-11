<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    echo json_encode(['status' => 'Starting database fix...']);
    
    // Fix existing predefined_items that have null main_category_id
    $fixQuery = "
        UPDATE predefined_items 
        SET main_category_id = (
            SELECT category_id 
            FROM subcategories 
            WHERE subcategories.id = predefined_items.subcat_id
        )
        WHERE main_category_id IS NULL AND subcat_id IS NOT NULL
    ";
    
    $result = $conn->exec($fixQuery);
    
    // Check the updated data
    $checkQuery = "SELECT id, name, main_category_id, subcat_id FROM predefined_items";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => "Fixed $result rows",
        'updated_items' => $items
    ]);

} catch (Exception $e) {
    error_log("Database Fix Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
