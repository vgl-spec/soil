<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    echo "=== FIXING PREDEFINED_ITEMS MAIN_CATEGORY_ID ===\n";
    
    // Update predefined_items where main_category_id is NULL
    // We need to set it based on the subcategory's category_id
    $updateQuery = "
        UPDATE predefined_items 
        SET main_category_id = (
            SELECT category_id 
            FROM subcategories 
            WHERE subcategories.id = predefined_items.subcat_id
        )
        WHERE main_category_id IS NULL
    ";
    
    $result = $conn->exec($updateQuery);
    echo "Updated $result rows in predefined_items table\n";
    
    // Verify the fix
    echo "\n=== VERIFICATION ===\n";
    $query = "SELECT * FROM predefined_items";
    $result = $conn->query($query);
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . "\n";
        echo "Name: " . $row['name'] . "\n";
        echo "Main Category ID: " . ($row['main_category_id'] ?? 'NULL') . "\n";
        echo "Subcat ID: " . ($row['subcat_id'] ?? 'NULL') . "\n";
        echo "Unit: " . $row['unit'] . "\n";
        echo "---\n";
    }
    
    echo "\n=== FIX COMPLETED ===\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
