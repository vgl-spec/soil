<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Check predefined_items table structure
    echo "=== PREDEFINED_ITEMS TABLE DATA ===\n";
    $query = "SELECT * FROM predefined_items LIMIT 5";
    $result = $conn->query($query);
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . "\n";
        echo "Name: " . $row['name'] . "\n";
        echo "Main Category ID: " . ($row['main_category_id'] ?? 'NULL') . "\n";
        echo "Subcat ID: " . ($row['subcat_id'] ?? 'NULL') . "\n";
        echo "Unit: " . $row['unit'] . "\n";
        echo "---\n";
    }
    
    // Check categories table
    echo "\n=== CATEGORIES TABLE DATA ===\n";
    $query = "SELECT * FROM categories";
    $result = $conn->query($query);
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . "\n";
        echo "Name: " . $row['name'] . "\n";
        echo "Label: " . $row['label'] . "\n";
        echo "---\n";
    }
    
    // Check subcategories table
    echo "\n=== SUBCATEGORIES TABLE DATA ===\n";
    $query = "SELECT * FROM subcategories";
    $result = $conn->query($query);
    
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: " . $row['id'] . "\n";
        echo "Category ID: " . $row['category_id'] . "\n";
        echo "Name: " . $row['name'] . "\n";
        echo "Label: " . $row['label'] . "\n";
        echo "---\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
