<?php
// Enable error reporting for debugging - keep off in production
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log errors to file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Allowed CORS origins
$allowed_origins = [
    'https://soil-indol.vercel.app',
    'https://soil-3tik.onrender.com',
    // add your other allowed frontend domains here
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
    } else {
        header('HTTP/1.1 403 Forbidden');
        error_log("CORS error: Origin not allowed - " . $_SERVER['HTTP_ORIGIN']);
        exit('Origin not allowed');
    }
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_log("Starting items.php script");

try {
    include_once 'db.php';
    error_log("Included db.php");

    if ($conn->connect_error) {
        error_log("DB Connection Error: " . $conn->connect_error);
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    error_log("DB connected successfully");

    // Query current inventory with CASE for invalid dates ('0000-00-00' => NULL)
    $query = "
    SELECT
        i.id,
        i.predefined_item_id,
        i.quantity,
        CASE
            WHEN i.harvest_date = '0000-00-00' OR i.harvest_date IS NULL THEN NULL
            ELSE i.harvest_date
        END as harvest_date,
        i.created_at,
        i.updated_at,
        p.name,
        p.unit,
        p.main_category_id as mainCategory,
        p.subcat_id as subcategory
    FROM items i
    INNER JOIN predefined_items p ON i.predefined_item_id = p.id
    ORDER BY i.created_at DESC
    ";

    error_log("Executing query: " . $query);
    $result = $conn->query($query);
    if (!$result) {
        error_log("Query failed: " . $conn->error);
        throw new Exception("Items query failed: " . $conn->error);
    }
    error_log("First query executed successfully");

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "id" => (int)$row['id'],
            "predefined_item_id" => (int)$row['predefined_item_id'],
            "name" => $row['name'],
            "mainCategory" => $row['mainCategory'],
            "subcategory" => $row['subcategory'],
            "quantity" => (int)$row['quantity'],
            "unit" => $row['unit'],
            "harvestDate" => $row['harvest_date'] ? date('Y-m-d', strtotime($row['harvest_date'])) : null
        ];
    }
    error_log("Fetched " . count($items) . " items");

    // Query full history - handle '0000-00-00' as NULL here too
    $historyQuery = "
    SELECT
        h.id,
        h.predefined_item_id,
        h.quantity,
        h.notes,
        h.change_type,
        h.date,
        CASE
            WHEN h.harvest_date = '0000-00-00' OR h.harvest_date IS NULL THEN NULL
            ELSE h.harvest_date
        END as harvest_date,
        p.name,
        p.unit,
        p.main_category_id AS mainCategory,
        p.subcat_id AS subcategory
    FROM item_history h
    INNER JOIN predefined_items p ON h.predefined_item_id = p.id
    ORDER BY h.date DESC
    ";

    error_log("Executing history query: " . $historyQuery);
    $historyResult = $conn->query($historyQuery);
    if (!$historyResult) {
        error_log("History query error: " . $conn->error);
        throw new Exception("History query failed: " . $conn->error);
    }
    error_log("Second query executed successfully");

    $history = [];
    while ($row = $historyResult->fetch_assoc()) {
        $history[] = [
            "id" => (int)$row['id'],
            "predefined_item_id" => (int)$row['predefined_item_id'],
            "name" => $row['name'],
            "mainCategory" => $row['mainCategory'],
            "subcategory" => $row['subcategory'],
            "quantity" => (int)$row['quantity'],
            "unit" => $row['unit'],
            "harvestDate" => $row['harvest_date'],  // will be NULL if invalid
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
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage(),
        "details" => "Check php_errors.log for more information"
    ]);
}

if (isset($conn)) {
    $conn->close();
    error_log("DB connection closed");
}

error_log("Finished items.php script");
