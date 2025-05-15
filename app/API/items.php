<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Turn off display errors in production
ini_set('log_errors', 1);  // Enable logging
ini_set('error_log', __DIR__ . '/php_errors.log');  // Log errors to a file

// Set headers for CORS
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once 'db.php';

    // Check the database connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Create item_history table if it doesn't exist (ensure this only runs once)
    $createTable = "CREATE TABLE IF NOT EXISTS item_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        predefined_item_id INT,
        quantity INT,
        notes VARCHAR(255),
        change_type ENUM('add', 'reduce', 'increase'),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        harvest_date DATE,
        FOREIGN KEY (predefined_item_id) REFERENCES predefined_items(id)
    )";

    if (!$conn->query($createTable)) {
        throw new Exception("Failed to create item_history table: " . $conn->error);
    }

    // First query: Get current inventory state
    $query = "
    SELECT 
        i.id,
        i.predefined_item_id,
        i.quantity,
        CASE 
            WHEN i.harvest_date = '0000-00-00' THEN NULL
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

    $result = $conn->query($query);
    if (!$result) {
        throw new Exception("Items query failed: " . $conn->error);
    }

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

    // Second query: Get full history
    $historyQuery = "
    SELECT 
        h.id,
        h.predefined_item_id,
        h.quantity,
        h.notes,
        h.change_type,
        h.date,
        h.harvest_date,    
        p.name,
        p.unit,
        p.main_category_id AS mainCategory,
        p.subcat_id AS subcategory
    FROM item_history h
    INNER JOIN predefined_items p ON h.predefined_item_id = p.id
    ORDER BY h.date DESC
    ";

    $historyResult = $conn->query($historyQuery);
    if (!$historyResult) {
        error_log("History query error: " . $conn->error);
        throw new Exception("History query failed: " . $conn->error);
    }

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
            "harvestDate" => $row['harvest_date'] ?? null,
            "notes" => $row['notes'] ?? "",
            "changeType" => $row['change_type'],
            "date" => $row['date']
        ];
    }

    // Return both current inventory and full history
    echo json_encode([
        "items" => $items,
        "history" => $history
    ]);

} catch (Exception $e) {
    // Log the exception and return a JSON response with the error
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);  // Internal server error
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage(),
        "details" => "Check php_errors.log for more information"
    ]);
}

$conn->close();  // Always close the connection
?>
