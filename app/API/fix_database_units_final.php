 <?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

try {
    // First, let's see what units currently exist
    $checkQuery = "SELECT DISTINCT unit, COUNT(*) as count FROM items GROUP BY unit";
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute();
    $currentUnits = $checkStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Update all variations to lowercase
    $updates = [
        'Kg' => 'kg',
        'KG' => 'kg', 
        'Kgs' => 'kg',
        'KGS' => 'kg',
        'Pcs' => 'pcs',
        'PCS' => 'pcs',
        'pcs' => 'pcs', // already correct
        'kg' => 'kg'    // already correct
    ];
    
    $totalUpdated = 0;
    $updateDetails = [];
    
    foreach ($updates as $oldUnit => $newUnit) {
        if ($oldUnit !== $newUnit) {
            $updateQuery = "UPDATE items SET unit = ? WHERE unit = ?";
            $updateStmt = $pdo->prepare($updateQuery);
            $updateStmt->execute([$newUnit, $oldUnit]);
            $affectedRows = $updateStmt->rowCount();
            
            if ($affectedRows > 0) {
                $totalUpdated += $affectedRows;
                $updateDetails[] = "Updated {$affectedRows} items from '{$oldUnit}' to '{$newUnit}'";
            }
        }
    }
    
    // Also update predefined_items table
    $predefinedUpdates = 0;
    foreach ($updates as $oldUnit => $newUnit) {
        if ($oldUnit !== $newUnit) {
            $updateQuery = "UPDATE predefined_items SET unit = ? WHERE unit = ?";
            $updateStmt = $pdo->prepare($updateQuery);
            $updateStmt->execute([$newUnit, $oldUnit]);
            $predefinedUpdates += $updateStmt->rowCount();
        }
    }
    
    // Check final state
    $finalCheckStmt = $pdo->prepare($checkQuery);
    $finalCheckStmt->execute();
    $finalUnits = $finalCheckStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database units have been standardized',
        'before' => $currentUnits,
        'after' => $finalUnits,
        'items_updated' => $totalUpdated,
        'predefined_items_updated' => $predefinedUpdates,
        'update_details' => $updateDetails
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
