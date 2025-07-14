<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        // Fetch logs and users for the report
        $logsQuery = "SELECT al.*, u.username 
                      FROM action_logs al 
                      LEFT JOIN users u ON al.user_id = u.id 
                      ORDER BY al.timestamp DESC";
        $stmt = $conn->prepare($logsQuery);
        $stmt->execute();
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $usersQuery = "SELECT COUNT(*) as total_users, 
                              COUNT(CASE WHEN role = 'supervisor' THEN 1 END) as supervisors,
                              COUNT(CASE WHEN role = 'operator' THEN 1 END) as operators,
                              COUNT(CASE WHEN role = 'user' THEN 1 END) as users
                       FROM users";
        $stmt = $conn->prepare($usersQuery);
        $stmt->execute();
        $userStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Generate CSV report content
        $filename = 'activity_report_' . date('Y-m-d_H-i-s') . '.csv';
        
        // Set headers for file download
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        // Create file handle
        $output = fopen('php://output', 'w');

        // Write report header
        fputcsv($output, ['Activity Report Generated: ' . date('Y-m-d H:i:s')]);
        fputcsv($output, ['']); // Empty line

        // Write user statistics
        fputcsv($output, ['USER STATISTICS']);
        fputcsv($output, ['Total Users', $userStats['total_users']]);
        fputcsv($output, ['Supervisors', $userStats['supervisors']]);
        fputcsv($output, ['Operators', $userStats['operators']]);
        fputcsv($output, ['Regular Users', $userStats['users']]);
        fputcsv($output, ['']); // Empty line

        // Write activity logs header
        fputcsv($output, ['ACTIVITY LOGS']);
        fputcsv($output, ['ID', 'Username', 'Action Type', 'Description', 'Timestamp']);

        // Write activity logs
        foreach ($logs as $log) {
            fputcsv($output, [
                $log['id'],
                $log['username'] ?: 'Unknown User',
                $log['action_type'],
                $log['description'],
                $log['timestamp']
            ]);
        }

        fclose($output);

    } catch (Exception $e) {
        // If there's an error, send JSON response instead
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Error generating report: ' . $e->getMessage()]);
    }

} else {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Only GET method is allowed.']);
}
?>
