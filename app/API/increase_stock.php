<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['https://soil-indol.vercel.app'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['https://soil-indol.vercel.app']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with 200 OK and exit early for preflight
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
    }

    // Fetch predefined_item_id from the items table
    $predefinedItemIdQuery = "SELECT predefined_item_id FROM items WHERE id = ?";
    $stmt = $conn->prepare($predefinedItemIdQuery);
    $stmt->bind_param("i", $itemId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $predefinedItemId = $row['predefined_item_id'];
    } else {
        throw new Exception("Item not found");
    }

    // Update the items table
    $updateItemQuery = "UPDATE items SET quantity = quantity + ?, harvest_date = ? WHERE id = ?";
    $stmt = $conn->prepare($updateItemQuery);
    $stmt->bind_param("isi", $quantity, $harvestDate, $itemId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("Failed to update item quantity");
    }

    // Insert into item_history table
   // Insert into item_history table
    $insertHistoryQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES (?, ?, ?, ?, 'increase', NOW())";
    $stmt = $conn->prepare($insertHistoryQuery);
    $stmt->bind_param("iiss", $predefinedItemId, $quantity, $harvestDate, $notes);
    $stmt->execute();

    // Insert into action_logs table
    
    $insertLogQuery = "INSERT INTO action_logs (user_id, action_type, description, timestamp) 
                      VALUES (?, 'increase_stock', ?, NOW())";
    $logDescription = "Increased stock for item ID: $itemId by $quantity units.";
    $stmt = $conn->prepare($insertLogQuery);
    $stmt->bind_param("is", $userId, $logDescription);
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