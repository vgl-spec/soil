<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Get all logs with user information
    $query = "SELECT al.id, u.username, al.action_type, al.description, al.timestamp 
              FROM action_logs al 
              LEFT JOIN users u ON al.user_id = u.id 
              ORDER BY al.timestamp DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set headers for CSV download
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="action_logs_' . date('Y-m-d_H-i-s') . '.csv"');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');

    // Create output stream
    $output = fopen('php://output', 'w');

    // Write CSV header
    fputcsv($output, ['ID', 'Username', 'Action Type', 'Description', 'Timestamp']);

    // Write CSV rows
    foreach ($logs as $log) {
        fputcsv($output, [
            $log['id'],
            $log['username'] ?? 'Unknown User',
            $log['action_type'],
            $log['description'],
            $log['timestamp']
        ]);
    }

    fclose($output);
    exit;

} catch (Exception $e) {
    error_log("API Error in download_logs.php: " . $e->getMessage());
    http_response_code(500);
    
    // Reset headers for JSON error response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
