<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $result = [
        'status' => 'ok',
        'database_connected' => true,
        'tables' => []
    ];

    // Check if predefined_items table exists and get its structure
    try {
        $query = "SELECT column_name, data_type, is_nullable, column_default 
                  FROM information_schema.columns 
                  WHERE table_name = 'predefined_items' 
                  ORDER BY ordinal_position";
        $stmt = $conn->query($query);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $result['tables']['predefined_items'] = [
            'exists' => count($columns) > 0,
            'columns' => $columns
        ];
    } catch (Exception $e) {
        $result['tables']['predefined_items'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }

    // Check categories table
    try {
        $query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'";
        $stmt = $conn->query($query);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result['tables']['categories'] = [
            'exists' => count($columns) > 0,
            'columns' => $columns
        ];
    } catch (Exception $e) {
        $result['tables']['categories'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }

    // Check subcategories table
    try {
        $query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subcategories'";
        $stmt = $conn->query($query);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result['tables']['subcategories'] = [
            'exists' => count($columns) > 0,
            'columns' => $columns
        ];
    } catch (Exception $e) {
        $result['tables']['subcategories'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }

    // Get sample data
    try {
        $query = "SELECT id, name, label FROM categories LIMIT 3";
        $stmt = $conn->query($query);
        $result['sample_categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $result['sample_categories'] = 'Error: ' . $e->getMessage();
    }

    try {
        $query = "SELECT id, category_id, name, label FROM subcategories LIMIT 3";
        $stmt = $conn->query($query);
        $result['sample_subcategories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $result['sample_subcategories'] = 'Error: ' . $e->getMessage();
    }

    echo json_encode($result, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'database_connected' => false
    ], JSON_PRETTY_PRINT);
}
?>
