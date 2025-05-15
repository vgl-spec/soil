<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}


// DB connection
require_once "db.php";

// Clean output buffer to remove extra whitespace or BOM
ob_clean();

// FETCH MAIN CATEGORIES
$mainQuery = "SELECT * FROM categories";
$mainResult = $conn->query($mainQuery);

$structured = [];

while ($cat = $mainResult->fetch_assoc()) {
    $structured[$cat['name']] = [
        "id" => $cat['id'], // <-- Add the main category ID here
        "label" => $cat['label'],
        "subcategories" => []
    ];
}

// FETCH SUBCATEGORIES
$subQuery = "SELECT * FROM subcategories";
$subResult = $conn->query($subQuery);

$subcategories = [];
while ($sub = $subResult->fetch_assoc()) {
    $mainId = $sub['category_id'];
    $mainNameQuery = "SELECT name FROM categories WHERE id = $mainId";
    $mainNameRes = $conn->query($mainNameQuery);
    $mainNameRow = $mainNameRes->fetch_assoc();
    $mainName = $mainNameRow['name'];

    $subcategories[$sub['id']] = $sub['name'];

    $structured[$mainName]["subcategories"][$sub['name']] = [
        "id" => $sub['id'], // <-- Add the subcategory ID here
        "label" => $sub['label'],
        "unit" => $sub['unit'],
        "predefinedItems" => []
    ];
}

// FETCH PREDEFINED ITEMS
$itemQuery = "SELECT * FROM predefined_items";
$itemResult = $conn->query($itemQuery);

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

// END CLEANLY
exit;