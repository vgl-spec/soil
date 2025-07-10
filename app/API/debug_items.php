<?php
// Temporary debug version of items.php
require_once __DIR__ . '/cors.php';

// Force clean output
if (ob_get_level()) {
    ob_end_clean();
}
ob_start();

header('Content-Type: application/json');
error_log("Starting debug items.php");

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Simple query without complex date casting
    $query = "
    SELECT
        i.id,
        i.predefined_item_id,
        i.quantity,
        i.harvest_date,
        i.created_at,
        i.updated_at,
        p.name,
        p.unit,
        p.main_category_id as mainCategory,
        p.subcat_id as subcategory
    FROM items i
    INNER JOIN predefined_items p ON i.predefined_item_id = p.id
    ORDER BY i.created_at DESC
    LIMIT 10;
    ";

    error_log("Executing simplified query");
    $result = $conn->query($query);
    if (!$result) {
        $errorInfo = $conn->errorInfo();
        throw new Exception("Query failed: " . $errorInfo[2]);
    }

    $items = [];
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        $items[] = [
            "id" => (int)$row['id'],
            "predefined_item_id" => (int)$row['predefined_item_id'],
            "name" => $row['name'],
            "mainCategory" => $row['maincategory'],
            "subcategory" => $row['subcategory'],
            "quantity" => (int)$row['quantity'],
            "unit" => $row['unit'],
            "harvestDate" => $row['harvest_date']
        ];
    }

    // Clean output buffer and send JSON
    ob_clean();
    echo json_encode([
        "success" => true,
        "items" => $items,
        "count" => count($items),
        "message" => "Simplified query successful"
    ]);

} catch (Exception $e) {
    ob_clean();
    error_log("Debug items error: " . $e->getMessage());
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

exit;
?>
