<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

// Include database connection via absolute path
require_once __DIR__ . '/db.php';

try {    // Fetch Main Categories
    $mainQuery = "SELECT * FROM categories";
    $mainStmt = $conn->query($mainQuery);
    if (!$mainStmt) {
        throw new Exception("Main categories query failed");
    }

    $structured = [];

    while ($cat = $mainStmt->fetch(PDO::FETCH_ASSOC)) {
        $structured[$cat['name']] = [
            "id" => (int)$cat['id'],
            "label" => $cat['label'],
            "subcategories" => []
        ];
    }

    // Fetch Subcategories
    $subQuery = "SELECT * FROM subcategories";
    $subStmt = $conn->query($subQuery);
    if (!$subStmt) {
        throw new Exception("Subcategories query failed");
    }

    $subcategories = [];    while ($sub = $subStmt->fetch(PDO::FETCH_ASSOC)) {
        $mainId = $sub['category_id'];
        $mainNameQuery = "SELECT name FROM categories WHERE id = ?";
        $mainNameStmt = $conn->prepare($mainNameQuery);
        $mainNameStmt->execute([$mainId]);
        $mainNameRow = $mainNameStmt->fetch(PDO::FETCH_ASSOC);
        $mainName = $mainNameRow['name'];

        $subcategories[$sub['id']] = $sub['name'];
        $structured[$mainName]["subcategories"][$sub['name']] = [
            "id" => (int)$sub['id'],
            "label" => $sub['label'],
            "unit" => $sub['unit'],
            "predefinedItems" => []
        ];
    }

    // Fetch Predefined Items
    $itemQuery = "SELECT * FROM predefined_items";
    $itemStmt = $conn->query($itemQuery);
    if (!$itemStmt) {
        throw new Exception("Predefined items query failed");
    }    while ($item = $itemStmt->fetch(PDO::FETCH_ASSOC)) {
        $subId = $item['subcat_id'];
        $mainId = $item['main_category_id'];

        if (isset($subcategories[$subId])) {
            $subName = $subcategories[$subId];
            $mainNameQuery = "SELECT name FROM categories WHERE id = ?";
            $mainNameStmt = $conn->prepare($mainNameQuery);
            $mainNameStmt->execute([$mainId]);
            $mainNameRow = $mainNameStmt->fetch(PDO::FETCH_ASSOC);
            $mainName = $mainNameRow['name'];

            $structured[$mainName]["subcategories"][$subName]["predefinedItems"][] = [
                "name" => $item['name'],
                "unit" => $item['unit']
            ];
        }
    }

    // Output clean JSON
    echo json_encode($structured, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage(),
        "details" => "Check php_errors.log for more information"
    ]);
}

exit;
?>
