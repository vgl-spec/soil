<?php
// Fix database sequences - run this once to fix the sequence synchronization issue
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $results = [];
    $errors = [];

    // Fix sequences for all tables with auto-increment IDs
    $tables = [
        'categories' => 'categories_id_seq',
        'subcategories' => 'subcategories_id_seq',
        'predefined_items' => 'predefined_items_id_seq',
        'items' => 'items_id_seq',
        'action_logs' => 'action_logs_id_seq',
        'users' => 'users_id_seq'
    ];

    foreach ($tables as $table => $sequence) {
        try {
            // Get the current max ID from the table
            $maxIdQuery = "SELECT COALESCE(MAX(id), 0) as max_id FROM $table";
            $stmt = $conn->prepare($maxIdQuery);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $maxId = $result['max_id'];

            // Reset the sequence to max_id + 1
            $resetQuery = "SELECT setval('$sequence', $maxId + 1, false)";
            $conn->exec($resetQuery);

            $results[$table] = [
                'max_id' => $maxId,
                'sequence_reset_to' => $maxId + 1,
                'status' => 'success'
            ];

        } catch (Exception $e) {
            $errors[$table] = $e->getMessage();
            $results[$table] = [
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    // Test insertion to make sure sequences work
    $testResults = [];
    
    // Test categories sequence
    try {
        $testStmt = $conn->prepare("SELECT nextval('categories_id_seq') as next_id");
        $testStmt->execute();
        $testResult = $testStmt->fetch(PDO::FETCH_ASSOC);
        $testResults['categories_next_id'] = $testResult['next_id'];
    } catch (Exception $e) {
        $testResults['categories_error'] = $e->getMessage();
    }

    // Test subcategories sequence
    try {
        $testStmt = $conn->prepare("SELECT nextval('subcategories_id_seq') as next_id");
        $testStmt->execute();
        $testResult = $testStmt->fetch(PDO::FETCH_ASSOC);
        $testResults['subcategories_next_id'] = $testResult['next_id'];
    } catch (Exception $e) {
        $testResults['subcategories_error'] = $e->getMessage();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database sequences have been synchronized',
        'results' => $results,
        'test_results' => $testResults,
        'errors' => $errors
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fix sequences: ' . $e->getMessage()
    ]);
}
?>
