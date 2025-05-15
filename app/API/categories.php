<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "db.php";

// Check if output buffering is active before cleaning
if (ob_get_level()) {
    ob_clean();
}

try {
    // Fetch Main Categories
    $mainQuery = "SELECT * FROM categories";
    $mainResult = $conn->query($mainQuery);
    if (!$mainResult) {
        throw new Exception("Main categories query failed: " . $conn->error);
    }

    $structured = [];

    while ($cat = $mainResult->fetch_assoc()) {
        $structured[$cat['name']] = [
            "id" => $cat['id'],
            "label" => $cat['label'],
            "subcategories" => []
        ];
    }

    // Fetch Subcategories
    $subQuery = "SELECT * FROM subcategories";
    $subResult = $conn->query($subQuery);
    if (!$subResult) {
        throw new Exception("Subcategories query failed: " . $conn->error);
    }

    $subcategories = [];
    while ($sub = $subResult->fetch_assoc()) {
        $mainId = $sub['category_id'];
        $mainNameQuery = "SELECT name FROM categories WHERE id = $mainId";
        $mainNameRes = $conn->query($mainNameQuery);
        $mainNameRow = $mainNameRes->fetch_assoc();
        $mainName = $mainNameRow['name'];

        $subcategories[$sub['id']] = $sub['name'];
        $structured[$mainName]["subcategories"][$sub['name']] = [
            "id" => $sub['id'],
            "label" => $sub['label'],
            "unit" => $sub['unit'],
            "predefinedItems" => []
        ];
    }

    // Fetch Predefined Items
    $itemQuery = "SELECT * FROM predefined_items";
    $itemResult = $conn->query($itemQuery);
    if (!$itemResult) {
        throw new Exception("Predefined items query failed: " . $conn->error);
    }

    while ($item = $itemResult->fetch_assoc()) {
        $subId = $item['subcat_id'];
        $mainId = $item['main_category_id'];

        if (isset($subcategories[$subId])) {
            $subName = $subcategories[$subId];
            $mainNameQuery = "SELECT name FROM categories WHERE id = $mainId";
            $mainNameRes = $conn->query($mainNameQuery);
            $mainNameRow = $mainNameRes->fetch_assoc();
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
