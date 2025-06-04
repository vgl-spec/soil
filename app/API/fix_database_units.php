<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

try {
    $total_affected = 0;
    
    // Fix units in predefined_items table
    // Convert "Kg" to "kg" and "Kgs" to "kg"
    $query1 = "UPDATE predefined_items SET unit = 'kg' WHERE unit IN ('Kg', 'Kgs')";
    $result1 = $conn->query($query1);
    $affected1 = $conn->affected_rows;
    
    // Convert "Pcs" to "pcs"
    $query2 = "UPDATE predefined_items SET unit = 'pcs' WHERE unit = 'Pcs'";
    $result2 = $conn->query($query2);
    $affected2 = $conn->affected_rows;
    
    // Fix units in items table
    // Convert "Kg" to "kg" and "Kgs" to "kg"
    $query3 = "UPDATE items SET unit = 'kg' WHERE unit IN ('Kg', 'Kgs')";
    $result3 = $conn->query($query3);
    $affected3 = $conn->affected_rows;
    
    // Convert "Pcs" to "pcs"
    $query4 = "UPDATE items SET unit = 'pcs' WHERE unit = 'Pcs'";
    $result4 = $conn->query($query4);
    $affected4 = $conn->affected_rows;
    
    $total_affected = $affected1 + $affected2 + $affected3 + $affected4;
    
    echo json_encode([
        'success' => true,
        'message' => 'Successfully updated units to lowercase format',
        'details' => [
            'predefined_items_kg' => $affected1,
            'predefined_items_pcs' => $affected2,
            'items_kg' => $affected3,
            'items_pcs' => $affected4,
            'total_affected' => $total_affected
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
