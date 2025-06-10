<?php
require_once __DIR__ . '/cors.php';

include_once 'db.php';

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

try {
    $conn->begin_transaction();

    $predefined_item_id = $data['predefined_item_id'];
    $quantity = $data['quantity'];
    $harvest_date = !empty($data['harvest_date']) ? $data['harvest_date'] : null;
    $notes = isset($data['notes']) && trim($data['notes']) !== '' ? $data['notes'] : 'Item Added';
    $created_at = date('Y-m-d H:i:s');    // Check if the item already exists
    $checkQuery = "SELECT id, quantity FROM items WHERE predefined_item_id = $1";
    $stmt = $conn->prepare($checkQuery);
    $result = $stmt->execute([$predefined_item_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        // Item exists, update its quantity and harvest date
        $new_quantity = $row['quantity'] + $quantity;
        $updateQuery = "UPDATE items SET quantity = $1, harvest_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3";
        $updateStmt = $conn->prepare($updateQuery);
        if (!$updateStmt->execute([$new_quantity, $harvest_date, $row['id']])) {
            throw new Exception("Failed to update item");
        }
        $item_id = $row['id'];
    } else {
        // Item does not exist, insert a new row
        $insertItemQuery = "INSERT INTO items (predefined_item_id, quantity, harvest_date, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id";
        $insertStmt = $conn->prepare($insertItemQuery);
        $insertStmt->execute([$predefined_item_id, $quantity, $harvest_date]);
        if (!$insertStmt->execute()) {
            throw new Exception("Failed to add item: " . $insertStmt->error);
        }
        $item_id = $conn->insert_id;
    }    // Insert into item_history with harvest_date
    $historyQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES ($1, $2, $3, $4, 'add', $5)";
    $historyStmt = $conn->prepare($historyQuery);
    if (!$historyStmt->execute([$predefined_item_id, $quantity, $harvest_date, $notes, $created_at])) {
        throw new Exception("Failed to add history");
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Item added or updated successfully',
        'id' => $item_id
    ]);

} catch (Exception $e) {
    $conn->rollback();
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>