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
    // Check units in predefined_items table
    $query = "SELECT DISTINCT unit, COUNT(*) as count FROM predefined_items GROUP BY unit";
    $result = $conn->query($query);
    
    $predefined_units = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $predefined_units[] = [
                'unit' => $row['unit'],
                'count' => $row['count']
            ];
        }
    }
    
    // Check units in items table
    $query2 = "SELECT DISTINCT unit, COUNT(*) as count FROM items GROUP BY unit";
    $result2 = $conn->query($query2);
    
    $items_units = [];
    if ($result2 && $result2->num_rows > 0) {
        while ($row = $result2->fetch_assoc()) {
            $items_units[] = [
                'unit' => $row['unit'],
                'count' => $row['count']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'predefined_items_units' => $predefined_units,
        'items_units' => $items_units
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
