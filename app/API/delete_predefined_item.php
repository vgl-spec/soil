<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    $predefined_item_id = $data['predefined_item_id'] ?? null;
    $user_id = $data['user_id'] ?? null;
    $force_delete = $data['force_delete'] ?? false;

    // Debug logging
    error_log("Delete predefined item request: " . json_encode($data));
    error_log("User ID: " . ($user_id ?? 'NULL'));

    if (!$predefined_item_id) {
        echo json_encode(['success' => false, 'message' => 'Missing predefined item ID']);
        exit;
    }

    // First, get the item details for logging before deletion
    $getItemQuery = "SELECT pi.id, pi.name, pi.unit, c.label as category_label, s.label as subcategory_label 
                     FROM predefined_items pi 
                     JOIN categories c ON pi.main_category_id = c.id 
                     JOIN subcategories s ON pi.subcat_id = s.id 
                     WHERE pi.id = ?";
    $getStmt = $conn->prepare($getItemQuery);
    $getStmt->execute([$predefined_item_id]);
    $itemDetails = $getStmt->fetch(PDO::FETCH_ASSOC);

    if (!$itemDetails) {
        echo json_encode(['success' => false, 'message' => 'Predefined item not found']);
        exit;
    }

    // Check if this predefined item is referenced in item_history
    $checkHistoryQuery = "SELECT COUNT(*) as count FROM item_history WHERE predefined_item_id = ?";
    $checkStmt = $conn->prepare($checkHistoryQuery);
    $checkStmt->execute([$predefined_item_id]);
    $historyCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Check if this predefined item is referenced in items table
    $checkItemsQuery = "SELECT COUNT(*) as count FROM items WHERE predefined_item_id = ?";
    $checkItemsStmt = $conn->prepare($checkItemsQuery);
    $checkItemsStmt->execute([$predefined_item_id]);
    $itemsCount = $checkItemsStmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($historyCount > 0 || $itemsCount > 0) {
        if (!$force_delete) {
            $message = "Cannot delete '{$itemDetails['name']}' because it is being used in the system.";
            if ($historyCount > 0) {
                $message .= " Found {$historyCount} history record(s).";
            }
            if ($itemsCount > 0) {
                $message .= " Found {$itemsCount} inventory item(s).";
            }
            $message .= " Please remove all references before deleting.";
            
            echo json_encode([
                'success' => false, 
                'message' => $message,
                'can_delete' => false,
                'references' => [
                    'history_count' => $historyCount,
                    'items_count' => $itemsCount
                ]
            ]);
            exit;
        } else {
            // Force delete: Remove references first
            error_log("Force deleting predefined item {$predefined_item_id} with {$historyCount} history records and {$itemsCount} item records");
            
            // Start transaction for consistency
            $conn->beginTransaction();
            
            try {
                // Delete from item_history first
                if ($historyCount > 0) {
                    $deleteHistoryQuery = "DELETE FROM item_history WHERE predefined_item_id = ?";
                    $deleteHistoryStmt = $conn->prepare($deleteHistoryQuery);
                    $deleteHistoryStmt->execute([$predefined_item_id]);
                }
                
                // Delete from items
                if ($itemsCount > 0) {
                    $deleteItemsQuery = "DELETE FROM items WHERE predefined_item_id = ?";
                    $deleteItemsStmt = $conn->prepare($deleteItemsQuery);
                    $deleteItemsStmt->execute([$predefined_item_id]);
                }
                
                // Now delete the predefined item
                $deleteQuery = "DELETE FROM predefined_items WHERE id = ?";
                $deleteStmt = $conn->prepare($deleteQuery);
                $result = $deleteStmt->execute([$predefined_item_id]);
                
                if (!$result) {
                    throw new Exception('Failed to delete predefined item');
                }
                
                // Commit the transaction
                $conn->commit();
                
                // Log the force deletion (same format as reduce_stock.php)
                if ($user_id) {
                    error_log("Attempting to log force deletion for user_id: " . $user_id);
                    $logStmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
                    $logResult = $logStmt->execute([
                        $user_id,
                        'delete_item',
                        'Force deleted predefined item: ' . $itemDetails['name'] . ' (' . $itemDetails['unit'] . ') from ' . $itemDetails['category_label'] . ' > ' . $itemDetails['subcategory_label'] . ' [removed ' . ($historyCount + $itemsCount) . ' references]'
                    ]);
                    error_log("Force deletion log result: " . ($logResult ? 'SUCCESS' : 'FAILED'));
                    if (!$logResult) {
                        error_log("Log error info: " . json_encode($logStmt->errorInfo()));
                    }
                } else {
                    error_log("No user_id provided for force deletion logging");
                }
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Predefined item and all references deleted successfully',
                    'deleted_item' => $itemDetails['name'],
                    'force_delete' => true,
                    'deleted_references' => [
                        'history_count' => $historyCount,
                        'items_count' => $itemsCount
                    ]
                ]);
                
            } catch (Exception $e) {
                // Rollback on error
                $conn->rollback();
                throw $e;
            }
        }
    } else {
        // No references found, safe to delete directly
        $deleteQuery = "DELETE FROM predefined_items WHERE id = ?";
        $deleteStmt = $conn->prepare($deleteQuery);
        $result = $deleteStmt->execute([$predefined_item_id]);

        if (!$result) {
            throw new Exception('Failed to delete predefined item');
        }

        // Log the normal deletion (same format as reduce_stock.php)
        if ($user_id) {
            error_log("Attempting to log normal deletion for user_id: " . $user_id);
            $logStmt = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
            $logResult = $logStmt->execute([
                $user_id,
                'delete_item',
                'Deleted predefined item: ' . $itemDetails['name'] . ' (' . $itemDetails['unit'] . ') from ' . $itemDetails['category_label'] . ' > ' . $itemDetails['subcategory_label']
            ]);
            error_log("Normal deletion log result: " . ($logResult ? 'SUCCESS' : 'FAILED'));
            if (!$logResult) {
                error_log("Log error info: " . json_encode($logStmt->errorInfo()));
            }
        } else {
            error_log("No user_id provided for normal deletion logging");
        }

        echo json_encode([
            'success' => true, 
            'message' => 'Predefined item deleted successfully',
            'deleted_item' => $itemDetails['name']
        ]);
    }

} catch (Exception $e) {
    error_log("API Error in delete_predefined_item.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
