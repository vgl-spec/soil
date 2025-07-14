<?php
require_once 'cors.php';
header('Content-Type: application/json');

require_once 'db.php';

// Create $pdo alias for compatibility
$pdo = $conn;

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
if (!isset($data['subcategory_id']) || !isset($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields: subcategory_id, user_id']);
    exit;
}

$subcategory_id = intval($data['subcategory_id']);
$user_id = intval($data['user_id']);
$force_delete = isset($data['force_delete']) ? $data['force_delete'] : false;

if ($subcategory_id <= 0 || $user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid subcategory_id or user_id']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Get subcategory details for logging
    $stmt = $pdo->prepare("SELECT name, label FROM subcategories WHERE id = ?");
    $stmt->execute([$subcategory_id]);
    $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$subcategory) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Subcategory not found']);
        exit;
    }

    $subcategory_name = $subcategory['label'] ?: $subcategory['name'];

    // Check if subcategory is being used (has predefined items)
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM predefined_items WHERE subcat_id = ?");
    $stmt->execute([$subcategory_id]);
    $predefined_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Check if subcategory is being used in inventory items (through predefined_items)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM items i 
        JOIN predefined_items pi ON i.predefined_item_id = pi.id 
        WHERE pi.subcat_id = ?
    ");
    $stmt->execute([$subcategory_id]);
    $items_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    $total_references = $predefined_count + $items_count;

    if ($total_references > 0 && !$force_delete) {
        $pdo->rollBack();
        $message = "Cannot delete subcategory '{$subcategory_name}' because it is being used in the system";
        if ($predefined_count > 0) {
            $message .= " ({$predefined_count} predefined items)";
        }
        if ($items_count > 0) {
            $message .= " ({$items_count} inventory items)";
        }
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }

    // If force delete, remove all references
    if ($force_delete && $total_references > 0) {
        // Delete related inventory items first (items that use predefined_items from this subcategory)
        if ($items_count > 0) {
            $stmt = $pdo->prepare("
                DELETE FROM items 
                WHERE predefined_item_id IN (
                    SELECT id FROM predefined_items WHERE subcat_id = ?
                )
            ");
            $stmt->execute([$subcategory_id]);
        }

        // Delete related predefined items
        if ($predefined_count > 0) {
            $stmt = $pdo->prepare("DELETE FROM predefined_items WHERE subcat_id = ?");
            $stmt->execute([$subcategory_id]);
        }
    }

    // Delete the subcategory
    $stmt = $pdo->prepare("DELETE FROM subcategories WHERE id = ?");
    $stmt->execute([$subcategory_id]);

    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Subcategory not found or already deleted']);
        exit;
    }

    // Log the action
    $action_description = $force_delete ? 
        "Force deleted subcategory '{$subcategory_name}' (removed {$total_references} references)" :
        "Deleted subcategory '{$subcategory_name}'";

    $stmt = $pdo->prepare("
        INSERT INTO action_logs (user_id, action_type, item_name, details, timestamp) 
        VALUES (?, 'delete_subcategory', ?, ?, NOW())
    ");
    $stmt->execute([$user_id, $subcategory_name, $action_description]);

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'success' => true, 
        'message' => "Subcategory '{$subcategory_name}' deleted successfully",
        'deleted_references' => $force_delete ? $total_references : 0
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error deleting subcategory: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Database error occurred while deleting subcategory',
        'error_details' => $e->getMessage(),
        'line' => $e->getLine()
    ]);
}
?>
