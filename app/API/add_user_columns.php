<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Add missing columns to users table if they don't exist
    $alterQueries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(50)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subdivision VARCHAR(255)"
    ];

    $results = [];
    foreach ($alterQueries as $query) {
        try {
            $stmt = $conn->prepare($query);
            $stmt->execute();
            $results[] = "Successfully executed: " . $query;
        } catch (Exception $e) {
            $results[] = "Error executing: " . $query . " - " . $e->getMessage();
        }
    }

    echo json_encode([
        'success' => true,
        'results' => $results
    ]);

} catch (Exception $e) {
    error_log("API Error in add_user_columns.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
