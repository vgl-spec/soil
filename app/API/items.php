<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

error_log("Starting items.php script");
// Include database connection via absolute path
require_once __DIR__ . '/db.php';
error_log("Included db.php");

// Query current inventory
$query = "
SELECT
    i.id,
    i.predefined_item_id,
    i.quantity,
    CASE 
        WHEN i.harvest_date IS NULL OR i.harvest_date = '0001-01-01' THEN NULL 
        ELSE i.harvest_date::date 
    END AS harvest_date,
    i.created_at,
    i.updated_at,
    p.name,
    p.unit,
    p.main_category_id as mainCategory,
    p.subcat_id as subcategory
FROM items i
INNER JOIN predefined_items p ON i.predefined_item_id = p.id
ORDER BY i.created_at DESC;
";

error_log("Executing query: " . $query);
$result = $conn->query($query);
if (!$result) {
    error_log("Query failed");
    throw new Exception("Items query failed");
}
error_log("First query executed successfully");

$items = [];    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    $items[] = [
        "id" => (int)$row['id'],
        "predefined_item_id" => (int)$row['predefined_item_id'],
        "name" => $row['name'],
        "mainCategory" => $row['mainCategory'],
        "subcategory" => $row['subcategory'],
        "quantity" => (int)$row['quantity'],
        "unit" => $row['unit'],
        "harvestDate" => $row['harvest_date']
    ];
}
error_log("Fetched " . count($items) . " items");    // Query full history
$historyQuery = "
SELECT
    h.id,
    h.predefined_item_id,
    h.quantity,
    h.notes,
    h.change_type,
    h.date,
    CASE 
        WHEN h.harvest_date IS NULL OR h.harvest_date = '0001-01-01' THEN NULL 
        ELSE h.harvest_date::date 
    END AS harvest_date,
    p.name,
    p.unit,
    p.main_category_id AS mainCategory,
    p.subcat_id AS subcategory
FROM item_history h
INNER JOIN predefined_items p ON h.predefined_item_id = p.id
ORDER BY h.date DESC;
";

error_log("Executing history query: " . $historyQuery);
$historyResult = $conn->query($historyQuery);
if (!$historyResult) {
    error_log("History query error: " . $conn->error);
    throw new Exception("History query failed: " . $conn->error);
}
error_log("Second query executed successfully");

$history = [];    while ($row = $historyResult->fetch(PDO::FETCH_ASSOC)) {
    $history[] = [
        "id" => (int)$row['id'],
        "predefined_item_id" => (int)$row['predefined_item_id'],
        "name" => $row['name'],
        "mainCategory" => $row['mainCategory'],
        "subcategory" => $row['subcategory'],
        "quantity" => (int)$row['quantity'],
        "unit" => $row['unit'],
        "harvestDate" => $row['harvest_date'],
        "notes" => $row['notes'] ?? "",
        "changeType" => $row['change_type'],
        "date" => $row['date']
    ];
}
error_log("Fetched " . count($history) . " history records");

echo json_encode([
    "items" => $items,
    "history" => $history
]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}

if (isset($conn)) {
    $conn->close();
    error_log("DB connection closed");
}

error_log("Finished items.php script");
