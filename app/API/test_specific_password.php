<?php
// Simple change password test
require_once __DIR__ . '/cors.php';
include 'db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Change Password API Test\n";
echo "=======================\n\n";

// Test data - replace with actual user data
$userId = 1; // supervisor
$currentPassword = '123456'; // known password from test above
$newPassword = 'newpass123';

if ($conn) {
    // Get user data
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "Testing for user: " . $user['username'] . "\n";
        echo "Current password test: '$currentPassword'\n";
        
        $verified = password_verify($currentPassword, $user['password']);
        echo "Password verification: " . ($verified ? 'SUCCESS' : 'FAILED') . "\n";
        
        if ($verified) {
            echo "✓ Current password is correct!\n";
            echo "The change password function should work.\n";
        } else {
            echo "✗ Current password is incorrect.\n";
            echo "Try using the correct password for user: " . $user['username'] . "\n";
        }
    } else {
        echo "User not found\n";
    }
} else {
    echo "Database connection failed\n";
}
?>
