<?php
// Test change password functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database connection
include 'db.php';

// Test database connection
echo "Testing database connection...\n";
if ($conn) {
    echo "✓ Database connection successful\n";
    
    // Test if users table exists and can be queried
    try {
        $testQuery = "SELECT id, username FROM users LIMIT 1";
        $stmt = $conn->prepare($testQuery);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "✓ Users table accessible\n";
            echo "Sample user ID: " . $user['id'] . "\n";
            echo "Sample username: " . $user['username'] . "\n";
            
            // Test password verification with a known user
            $getUserQuery = "SELECT id, username, password FROM users WHERE id = ?";
            $stmt = $conn->prepare($getUserQuery);
            $stmt->execute([$user['id']]);
            $userDetails = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($userDetails) {
                echo "✓ User details retrieved successfully\n";
                echo "Password hash exists: " . (!empty($userDetails['password']) ? 'Yes' : 'No') . "\n";
                
                // Test password_verify function
                if (!empty($userDetails['password'])) {
                    echo "✓ Password hash is not empty\n";
                } else {
                    echo "✗ Password hash is empty - this could be the issue\n";
                }
            }
        } else {
            echo "✗ No users found in database\n";
        }
        
    } catch (PDOException $e) {
        echo "✗ Error querying users table: " . $e->getMessage() . "\n";
    }
    
    // Test action_logs table
    try {
        $testLogQuery = "SELECT COUNT(*) as count FROM action_logs";
        $stmt = $conn->prepare($testLogQuery);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✓ Action logs table accessible with " . $result['count'] . " records\n";
    } catch (PDOException $e) {
        echo "✗ Error accessing action_logs table: " . $e->getMessage() . "\n";
    }
    
} else {
    echo "✗ Database connection failed\n";
    echo "Check the database configuration in db.php\n";
}

// Test password hashing functions
echo "\nTesting password functions...\n";
$testPassword = "test123";
$hash = password_hash($testPassword, PASSWORD_DEFAULT);
echo "✓ password_hash function works\n";

$verify = password_verify($testPassword, $hash);
echo "✓ password_verify function works: " . ($verify ? 'Yes' : 'No') . "\n";

echo "\nTest completed.\n";
?>
