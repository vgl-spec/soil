<?php
require_once 'app/API/db.php';

try {
    $stmt = $conn->prepare('DELETE FROM subcategories WHERE id IN (5, 6)');
    $result = $stmt->execute();
    echo 'Deleted test subcategories: ' . ($result ? 'success' : 'failed') . PHP_EOL;
    
    // Check remaining subcategories
    $stmt = $conn->prepare('SELECT id, name, label FROM subcategories ORDER BY id');
    $stmt->execute();
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Remaining subcategories:" . PHP_EOL;
    foreach ($subcategories as $sub) {
        echo "ID: {$sub['id']}, Name: {$sub['name']}, Label: {$sub['label']}" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
?>
