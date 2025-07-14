<?php
// Test password verification
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db.php';

echo "Password Verification Test\n";
echo "=========================\n\n";

if ($conn) {
    // Get all users and check their password formats
    $stmt = $conn->prepare("SELECT id, username, password FROM users LIMIT 5");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        echo "User: " . $user['username'] . " (ID: " . $user['id'] . ")\n";
        echo "Password: " . substr($user['password'], 0, 20) . "...\n";
        
        $passwordInfo = password_get_info($user['password']);
        echo "Hash Algorithm: " . ($passwordInfo['algo'] ?? 'none') . "\n";
        echo "Algorithm Name: " . ($passwordInfo['algoName'] ?? 'unknown') . "\n";
        
        // Test with common passwords
        $testPasswords = ['password', 'admin', '123456', 'test123', $user['username']];
        
        foreach ($testPasswords as $testPass) {
            $verified = password_verify($testPass, $user['password']);
            if ($verified) {
                echo "✓ Password '$testPass' matches (using password_verify)\n";
            }
            
            // Also test plain text comparison
            if ($testPass === $user['password']) {
                echo "✓ Password '$testPass' matches (plain text)\n";
            }
        }
        
        echo "\n";
    }
} else {
    echo "Database connection failed\n";
}
?>
