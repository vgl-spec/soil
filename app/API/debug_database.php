<?php
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $debug_info = [];

    // Get categories
    $catQuery = "SELECT * FROM categories ORDER BY id";
    $catStmt = $conn->prepare($catQuery);
    $catStmt->execute();
    $debug_info['categories'] = $catStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get subcategories
    $subQuery = "SELECT * FROM subcategories ORDER BY id";
    $subStmt = $conn->prepare($subQuery);
    $subStmt->execute();
    $debug_info['subcategories'] = $subStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get predefined items
    $itemQuery = "SELECT * FROM predefined_items ORDER BY id";
    $itemStmt = $conn->prepare($itemQuery);
    $itemStmt->execute();
    $debug_info['predefined_items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($debug_info, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
