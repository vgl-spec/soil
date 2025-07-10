<?php
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Get raw data and decode
    $raw_data = file_get_contents("php://input");
    error_log("Received raw data: " . $raw_data);

    // Ensure we have data
    if (empty($raw_data)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No data received'
        ]);
        exit();
    }

    $data = json_decode($raw_data, true);
    error_log("Decoded data: " . print_r($data, true));

    // Validate required fields
    if (!isset($data['predefined_item_id'], $data['quantity'], $data['harvest_date'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields',
            'received' => $data
        ]);
        exit();
    }

    $conn->beginTransaction();

    $predefined_item_id = (int)$data['predefined_item_id'];
    $quantity = (int)$data['quantity'];
    $harvest_date = !empty($data['harvest_date']) ? $data['harvest_date'] : null;
    $notes = isset($data['notes']) && trim($data['notes']) !== '' ? $data['notes'] : 'Item Added';
    $created_at = date('Y-m-d H:i:s');

    error_log("Processing: predefined_item_id=$predefined_item_id, quantity=$quantity, harvest_date=$harvest_date");

    // Check if the item already exists
    $checkQuery = "SELECT id, quantity FROM items WHERE predefined_item_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->execute([$predefined_item_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // Item exists, update its quantity and harvest date
        $new_quantity = $row['quantity'] + $quantity;
        $updateQuery = "UPDATE items SET quantity = ?, harvest_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $updateStmt = $conn->prepare($updateQuery);
        if (!$updateStmt->execute([$new_quantity, $harvest_date, $row['id']])) {
            throw new Exception("Failed to update item");
        }
        $item_id = $row['id'];
        error_log("Updated existing item ID: $item_id with new quantity: $new_quantity");
    } else {
        // Item does not exist, insert a new row
        $insertItemQuery = "INSERT INTO items (predefined_item_id, quantity, harvest_date, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id";
        $insertStmt = $conn->prepare($insertItemQuery);
        $insertStmt->execute([$predefined_item_id, $quantity, $harvest_date]);
        $result = $insertStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result || !$result['id']) {
            throw new Exception("Failed to add item - no ID returned");
        }
        $item_id = $result['id'];
        error_log("Created new item ID: $item_id");
    }

    // Insert into item_history with harvest_date
    $historyQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES (?, ?, ?, ?, 'add', ?)";
    $historyStmt = $conn->prepare($historyQuery);
    if (!$historyStmt->execute([$predefined_item_id, $quantity, $harvest_date, $notes, $created_at])) {
        throw new Exception("Failed to add history");
    }

    $conn->commit();
    error_log("Transaction committed successfully");

    echo json_encode([
        'success' => true,
        'message' => 'Item added or updated successfully',
        'id' => (int)$item_id
    ]);

} catch (Exception $e) {
    if ($conn) {
        $conn->rollback();
    }
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
