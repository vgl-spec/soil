<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    // Read the input data
    $inputData = json_decode(file_get_contents('php://input'), true);

    // Validate input data
    if (empty($inputData['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'User ID is required.']);
        exit();
    }

    $userId = $inputData['user_id'];

    try {
        // Check if user exists and is not a supervisor
        $checkUserQuery = "SELECT * FROM users WHERE id = ?";
        $stmt = $conn->prepare($checkUserQuery);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found.']);
            exit();
        }

        if ($user['role'] === 'supervisor') {
            echo json_encode(['success' => false, 'message' => 'Cannot delete supervisor accounts.']);
            exit();
        }

        // Begin transaction to ensure data consistency
        $conn->beginTransaction();

        try {
            // First, delete all action logs for this user
            $deleteLogsQuery = "DELETE FROM action_logs WHERE user_id = ?";
            $stmt = $conn->prepare($deleteLogsQuery);
            $stmt->execute([$userId]);

            // Then delete the user
            $deleteUserQuery = "DELETE FROM users WHERE id = ?";
            $stmt = $conn->prepare($deleteUserQuery);
            $stmt->execute([$userId]);

            // Commit the transaction
            $conn->commit();

            echo json_encode([
                'success' => true, 
                'message' => 'User and associated data deleted successfully.',
                'deleted_user' => $user['username']
            ]);

        } catch (Exception $e) {
            // Rollback the transaction if something goes wrong
            $conn->rollback();
            throw $e;
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
