<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
    $predefinedItemIdQuery = "SELECT predefined_item_id FROM items WHERE id = $1";
    $stmt = $conn->prepare($predefinedItemIdQuery);
    $stmt->execute([$itemId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        $predefinedItemId = $row['predefined_item_id'];
    } else {
        throw new Exception("Item not found");
    }

    // Update the items table
    $updateItemQuery = "UPDATE items SET quantity = quantity + $1, harvest_date = $2 WHERE id = $3";
    $stmt = $conn->prepare($updateItemQuery);
    $result = $stmt->execute([$quantity, $harvestDate, $itemId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Failed to update item quantity");
    }    // Insert into item_history table
    $insertHistoryQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES ($1, $2, $3, $4, 'increase', CURRENT_TIMESTAMP)";
    $stmt = $conn->prepare($insertHistoryQuery);
    $stmt->execute([$predefinedItemId, $quantity, $harvestDate, $notes]);

    // Insert into action_logs table
    $insertLogQuery = "INSERT INTO action_logs (user_id, action_type, description, timestamp) 
                      VALUES ($1, 'increase_stock', $2, CURRENT_TIMESTAMP)";
    $logDescription = "Increased stock for item ID: $itemId by $quantity units.";
    $stmt = $conn->prepare($insertLogQuery);
    $stmt->execute([$userId, $logDescription]);
    $stmt->execute();

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