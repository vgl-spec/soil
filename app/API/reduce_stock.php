<?php

header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'db.php';

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Retrieve and decode the JSON payload
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
    exit;
}

// Extract data from the payload
$itemId = $data['itemId'] ?? null;
$quantity = $data['quantity'] ?? null;
$notes = $data['notes'] ?? 'Stock reduced';
$userId = $data['userId'] ?? null;
$created_at = date('Y-m-d H:i:s');

if (!$userId) {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
    exit;
}

if (!$itemId || !$quantity) {
    echo json_encode(["success" => false, "message" => "Item ID and quantity are required"]);
    exit;
}

// Fetch predefined_item_id from the items table
$predefinedItemIdQuery = "SELECT predefined_item_id FROM items WHERE id = $1";
$stmt = $conn->prepare($predefinedItemIdQuery);
$stmt->execute([$itemId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if ($row) {
    $predefinedItemId = $row['predefined_item_id'];
} else {
    echo json_encode(["success" => false, "message" => "Item not found"]);
    exit;
}

// Update the items table (do NOT update harvest_date)
$updateItemQuery = "UPDATE items SET quantity = quantity + $1 WHERE id = $2";
$stmt = $conn->prepare($updateItemQuery);
$stmt->execute([$quantity, $itemId]);
$stmt->execute();

// Insert into item_history table with NULL harvest_date
$insertHistoryQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES ($1, $2, $3, $4, 'reduce', $5)";
$stmt = $conn->prepare($insertHistoryQuery);
$stmt->execute([$predefinedItemId, $quantity, null, $notes, $created_at]);

// Insert into action_logs table
$insertLogQuery = "INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES ($1, 'reduce_stock', $2, CURRENT_TIMESTAMP)";
$logDescription = "Reduced stock for item ID: $itemId by $quantity units.";
$stmt = $conn->prepare($insertLogQuery);
$stmt->execute([$userId, $logDescription]);

echo json_encode(["success" => true, "message" => "Stock reduced and logged successfully"]);
?>