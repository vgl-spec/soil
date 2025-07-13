<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

include 'db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Retrieve and decode the JSON payload
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON payload: " . json_last_error_msg());
    }

    // Extract data from the payload
    $itemId = $data['itemId'] ?? null;
    $quantity = $data['quantity'] ?? null;
    $notes = $data['notes'] ?? 'Stock increased';
    $userId = $data['userId'] ?? null;
    $harvestDate = $data['harvestDate'] ?? null;

    error_log("Received harvestDate: " . $harvestDate);
    error_log("Harvest Date being saved: " . $harvestDate);

    if (!$userId) {
        throw new Exception("User ID is required");
    }

    if (!$itemId || !$quantity) {
        throw new Exception("Item ID and quantity are required");
    }    // Fetch predefined_item_id from the items table
    $predefinedItemIdQuery = "SELECT predefined_item_id FROM items WHERE id = ?";
    $stmt = $conn->prepare($predefinedItemIdQuery);
    $stmt->execute([$itemId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        $predefinedItemId = $row['predefined_item_id'];
    } else {
        throw new Exception("Item not found");
    }

    // Update the items table
    $updateItemQuery = "UPDATE items SET quantity = quantity + ?, harvest_date = ? WHERE id = ?";
    $stmt = $conn->prepare($updateItemQuery);
    $result = $stmt->execute([$quantity, $harvestDate, $itemId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Failed to update item quantity");
    }    // Insert into item_history table
    $insertHistoryQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES (?, ?, ?, ?, 'increase', CURRENT_TIMESTAMP)";
    $stmt = $conn->prepare($insertHistoryQuery);
    $stmt->execute([$predefinedItemId, $quantity, $harvestDate, $notes]);

    // Get predefined item details for better logging
    $getItemQuery = "SELECT pi.name, pi.unit, c.label as category_label, s.label as subcategory_label 
                     FROM predefined_items pi 
                     JOIN categories c ON pi.main_category_id = c.id 
                     JOIN subcategories s ON pi.subcat_id = s.id 
                     WHERE pi.id = ?";
    $getStmt = $conn->prepare($getItemQuery);
    $getStmt->execute([$predefinedItemId]);
    $itemDetails = $getStmt->fetch(PDO::FETCH_ASSOC);

    error_log("Predefined item ID: " . $predefinedItemId);
    error_log("Item details query result: " . json_encode($itemDetails));

    // Create description with item name
    $logDescription = "Increased stock: quantity $quantity";
    if ($itemDetails) {
        $logDescription .= " (" . $itemDetails['name'] . " - " . $itemDetails['unit'] . ") from " . $itemDetails['category_label'] . " > " . $itemDetails['subcategory_label'];
    } else {
        $logDescription .= " (item ID: $itemId)";
    }

    error_log("Final log description: " . $logDescription);

    // Insert into action_logs table
    $insertLogQuery = "INSERT INTO action_logs (user_id, action_type, description, timestamp) 
                      VALUES (?, 'increase_stock', ?, CURRENT_TIMESTAMP)";
    $stmt = $conn->prepare($insertLogQuery);
    $stmt->execute([$userId, $logDescription]);

    echo json_encode(["success" => true, "message" => "Stock increased and logged successfully"]);

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "details" => "Check php_errors.log for more information"
    ]);
}

$conn->close();
?>