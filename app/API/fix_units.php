<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'db.php';

try {
    $conn->begin_transaction();
    
    // Update all units to lowercase format
    $updateQuery = "UPDATE predefined_items SET 
                    unit = CASE 
                        WHEN unit IN ('Kg', 'KG', 'kg', 'Kgs') THEN 'kg'
                        WHEN unit IN ('Pcs', 'PCS', 'pcs', 'Pc') THEN 'pcs'
                        ELSE unit
                    END";
    
    $result = $conn->query($updateQuery);
    
    if ($result) {
        $affected_rows = $conn->affected_rows;
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "Updated $affected_rows rows to use consistent unit format",
            'affected_rows' => $affected_rows
        ]);
    } else {
        throw new Exception("Failed to update units: " . $conn->error);
    }
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
