<?php
// Reset password for testing
include 'db.php';

$userId = 1; // supervisor
$newPassword = 'test123'; // Set a known password for testing

if ($conn) {
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    
    if ($stmt->execute([$hashedPassword, $userId])) {
        echo "Password reset successful!\n";
        echo "User ID: $userId\n";
        echo "New password: $newPassword\n";
        echo "You can now use this password to change it through the UI.\n";
    } else {
        echo "Password reset failed.\n";
    }
} else {
    echo "Database connection failed.\n";
}
?>
