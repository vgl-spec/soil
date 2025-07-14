<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log all requests for debugging
error_log("Change password request received - Method: " . $_SERVER['REQUEST_METHOD']);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Read the input data
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    // Log the received data (without passwords for security)
    error_log("Received data - user_id: " . ($inputData['user_id'] ?? 'missing') . 
              ", current_password: " . (isset($inputData['current_password']) ? '[PROVIDED]' : '[MISSING]') .
              ", new_password: " . (isset($inputData['new_password']) ? '[PROVIDED]' : '[MISSING]'));

    // Validate input data
    if (empty($inputData['user_id']) || empty($inputData['current_password']) || empty($inputData['new_password'])) {
        $missing = [];
        if (empty($inputData['user_id'])) $missing[] = 'user_id';
        if (empty($inputData['current_password'])) $missing[] = 'current_password';
        if (empty($inputData['new_password'])) $missing[] = 'new_password';
        
        error_log("Missing fields: " . implode(', ', $missing));
        echo json_encode(['success' => false, 'message' => 'Missing fields: ' . implode(', ', $missing)]);
        exit();
    }

    $userId = $inputData['user_id'];
    $currentPassword = $inputData['current_password'];
    $newPassword = $inputData['new_password'];

    // Validate new password length
    if (strlen($newPassword) < 6) {
        error_log("Password too short for user: " . $userId);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long.']);
        exit();
    }

    try {
        // Check database connection first
        if (!$conn) {
            error_log("Database connection is null");
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit();
        }
        
        error_log("Attempting to get user data for user_id: " . $userId);
        
        // Get user's current password from database
        $getUserQuery = "SELECT password FROM users WHERE id = ?";
        $stmt = $conn->prepare($getUserQuery);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            error_log("User not found with id: " . $userId);
            echo json_encode(['success' => false, 'message' => 'User not found.']);
            exit();
        }

        error_log("User found, verifying current password");
        error_log("Stored password hash: " . substr($user['password'], 0, 20) . "... (truncated for security)");
        error_log("Current password length: " . strlen($currentPassword));
        
        // Check if the stored password is actually hashed
        $passwordInfo = password_get_info($user['password']);
        error_log("Password hash info - algo: " . ($passwordInfo['algo'] ?? 'none') . ", algoName: " . ($passwordInfo['algoName'] ?? 'unknown'));
        
        // Verify current password
        $verificationResult = password_verify($currentPassword, $user['password']);
        error_log("Password verification result: " . ($verificationResult ? 'TRUE' : 'FALSE'));
        
        if (!$verificationResult) {
            error_log("Current password verification failed for user: " . $userId);
            error_log("Trying plain text comparison as fallback...");
            
            // Fallback: check if password is stored as plain text
            if ($currentPassword === $user['password']) {
                error_log("Plain text password match found - password needs to be hashed");
                // Password matches but is stored as plain text, let's hash it
                $hashedPassword = password_hash($currentPassword, PASSWORD_DEFAULT);
                $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $updateStmt->execute([$hashedPassword, $userId]);
                error_log("Auto-hashed existing password for user: " . $userId);
                // Continue with password change
            } else {
                error_log("Both hashed and plain text verification failed");
                echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
                exit();
            }
        }

        error_log("Current password verified, hashing new password");

        // Hash the new password
        $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        error_log("Attempting to update password in database");

        // Update password in database
        $updateQuery = "UPDATE users SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($updateQuery);
        
        if ($stmt->execute([$hashedNewPassword, $userId])) {
            error_log("Password updated successfully, logging action");
            
            // Log the password change action (using the enum value you added)
            $logQuery = "INSERT INTO action_logs (user_id, action_type, description) VALUES (?, 'change_password', 'Password changed successfully')";
            $logStmt = $conn->prepare($logQuery);
            $logStmt->execute([$userId]);

            error_log("Password change completed successfully for user: " . $userId);
            echo json_encode([
                'success' => true, 
                'message' => 'Password changed successfully.'
            ]);
        } else {
            error_log("Failed to execute password update query for user: " . $userId);
            $errorInfo = $stmt->errorInfo();
            error_log("SQL Error Info: " . print_r($errorInfo, true));
            echo json_encode(['success' => false, 'message' => 'Failed to update password. Please try again.']);
        }

    } catch (PDOException $e) {
        error_log("Database error in change_password.php: " . $e->getMessage());
        error_log("Error Code: " . $e->getCode());
        error_log("Error Info: " . print_r($e->errorInfo, true));
        echo json_encode(['success' => false, 'message' => 'Database error occurred: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("General error in change_password.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'An error occurred while changing password: ' . $e->getMessage()]);
    }

} else {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    echo json_encode(['success' => false, 'message' => 'Only POST method is allowed.']);
}
?>
