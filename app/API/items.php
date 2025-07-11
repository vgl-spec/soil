<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

error_log("Starting items.php script");
// Include database connection via absolute path
require_once __DIR__ . '/db.php';
error_log("Included db.php");

try {
    // Check if database connection exists
    if (!$conn) {
        error_log("Database connection is null");
        throw new Exception("Database connection failed");
    }

    error_log("Database connection verified");

// Query current inventory
$query = "
SELECT
    i.id,
    i.predefined_item_id,
    i.quantity,
    CASE 
        WHEN i.harvest_date IS NULL OR i.harvest_date = '0001-01-01' THEN NULL 
        ELSE DATE(i.harvest_date)
    END AS harvest_date,
    i.created_at,
    i.updated_at,
    p.name,
    p.unit,
    COALESCE(p.main_category_id, 0) as mainCategory,
    COALESCE(p.subcat_id, 0) as subcategory
FROM items i
INNER JOIN predefined_items p ON i.predefined_item_id = p.id
ORDER BY i.created_at DESC;
";

error_log("Executing query: " . $query);
$result = $conn->query($query);
if (!$result) {
    $errorInfo = $conn->errorInfo();
    error_log("Query failed: " . $errorInfo[2]);
    throw new Exception("Items query failed: " . $errorInfo[2]);
}
error_log("First query executed successfully");

$items = [];
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    // Add debugging to see what's in the database
    error_log("Database row: " . print_r($row, true));
    
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
error_log("Fetched " . count($items) . " items");

// Query full history
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
        ELSE DATE(h.harvest_date)
    END AS harvest_date,
    p.name,
    p.unit,
    COALESCE(p.main_category_id, 0) AS mainCategory,
    COALESCE(p.subcat_id, 0) AS subcategory
FROM item_history h
INNER JOIN predefined_items p ON h.predefined_item_id = p.id
ORDER BY h.date DESC;
";

error_log("Executing history query: " . $historyQuery);
$historyResult = $conn->query($historyQuery);
if (!$historyResult) {
    $errorInfo = $conn->errorInfo();
    error_log("History query error: " . $errorInfo[2]);
    throw new Exception("History query failed: " . $errorInfo[2]);
}
error_log("Second query executed successfully");

$history = [];
while ($row = $historyResult->fetch(PDO::FETCH_ASSOC)) {
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

// Clean any output buffer before sending JSON
if (ob_get_level()) {
    ob_clean();
}

echo json_encode([
    "debug" => "Database debugging enabled",
    "items" => $items,
    "history" => $history
]);

} catch (Exception $e) {
    // Clean any output buffer before sending error response
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}

if (isset($conn)) {
    $conn = null;
    error_log("DB connection closed");
}

error_log("Finished items.php script");
exit;
?>
