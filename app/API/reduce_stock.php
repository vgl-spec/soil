<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';


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
$predefinedItemIdQuery = "SELECT predefined_item_id FROM items WHERE id = ?";
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
$updateItemQuery = "UPDATE items SET quantity = quantity + ? WHERE id = ?";
$stmt = $conn->prepare($updateItemQuery);
$stmt->execute([$quantity, $itemId]);

// Insert into item_history table with NULL harvest_date
$insertHistoryQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES (?, ?, ?, ?, 'reduce', ?)";
$stmt = $conn->prepare($insertHistoryQuery);
$stmt->execute([$predefinedItemId, $quantity, null, $notes, $created_at]);

// Get predefined item details for better logging
$getItemQuery = "SELECT pi.name, pi.unit, c.label as category_label, s.label as subcategory_label 
                 FROM predefined_items pi 
                 JOIN categories c ON pi.main_category_id = c.id 
                 JOIN subcategories s ON pi.subcat_id = s.id 
                 WHERE pi.id = ?";
$getStmt = $conn->prepare($getItemQuery);
$getStmt->execute([$predefinedItemId]);
$itemDetails = $getStmt->fetch(PDO::FETCH_ASSOC);

// Create description with item name
$logDescription = "Reduced stock: quantity $quantity";
if ($itemDetails) {
    $logDescription .= " (" . $itemDetails['name'] . " - " . $itemDetails['unit'] . ") from " . $itemDetails['category_label'] . " > " . $itemDetails['subcategory_label'];
} else {
    $logDescription .= " (item ID: $itemId)";
}

// Insert into action_logs table
$insertLogQuery = "INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, 'reduce_stock', ?, CURRENT_TIMESTAMP)";
$stmt = $conn->prepare($insertLogQuery);
$stmt->execute([$userId, $logDescription]);

echo json_encode(["success" => true, "message" => "Stock reduced and logged successfully"]);
?>