<?php
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Debug: Check the actual structure and content of predefined_items
    $debugQuery = "SELECT * FROM predefined_items WHERE id = 1";
    $debugStmt = $conn->prepare($debugQuery);
    $debugStmt->execute();
    $predefinedItem = $debugStmt->fetch(PDO::FETCH_ASSOC);

    // Debug: Check if there are any items
    $itemsQuery = "SELECT * FROM items WHERE id = 1";
    $itemsStmt = $conn->prepare($itemsQuery);
    $itemsStmt->execute();
    $item = $itemsStmt->fetch(PDO::FETCH_ASSOC);

    // Debug: Check the JOIN
    $joinQuery = "
    SELECT 
        i.id,
        i.predefined_item_id,
        p.id as p_id,
        p.name,
        p.main_category_id,
        p.subcat_id,
        p.unit
    FROM items i
    INNER JOIN predefined_items p ON i.predefined_item_id = p.id
    WHERE i.id = 1
    ";
    $joinStmt = $conn->prepare($joinQuery);
    $joinStmt->execute();
    $joinResult = $joinStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'predefined_item' => $predefinedItem,
        'item' => $item,
        'join_result' => $joinResult
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
