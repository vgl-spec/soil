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
    $created_at = date('Y-m-d H:i:s');

    // Check if the item already exists
    $checkQuery = "SELECT id, quantity FROM items WHERE predefined_item_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("i", $predefined_item_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Item exists, update its quantity and harvest date
        $new_quantity = $row['quantity'] + $quantity;
        $updateQuery = "UPDATE items SET quantity = ?, harvest_date = ?, updated_at = NOW() WHERE id = ?";
        $updateStmt = $conn->prepare($updateQuery);
        $updateStmt->bind_param("isi", $new_quantity, $harvest_date, $row['id']);
        if (!$updateStmt->execute()) {
            throw new Exception("Failed to update item: " . $updateStmt->error);
        }
        $item_id = $row['id'];
    } else {
        // Item does not exist, insert a new row
        $insertItemQuery = "INSERT INTO items (predefined_item_id, quantity, harvest_date, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
        $insertStmt = $conn->prepare($insertItemQuery);
        $insertStmt->bind_param("iis", $predefined_item_id, $quantity, $harvest_date);
        if (!$insertStmt->execute()) {
            throw new Exception("Failed to add item: " . $insertStmt->error);
        }
        $item_id = $conn->insert_id;
    }

    // Insert into item_history with harvest_date
    $historyQuery = "INSERT INTO item_history (predefined_item_id, quantity, harvest_date, notes, change_type, date) VALUES (?, ?, ?, ?, 'add', ?)";
    $historyStmt = $conn->prepare($historyQuery);
    $historyStmt->bind_param("iisss", $predefined_item_id, $quantity, $harvest_date, $notes, $created_at);
    if (!$historyStmt->execute()) {
        throw new Exception("Failed to add history: " . $historyStmt->error);
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