<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting password check...\n";
require_once 'db.php';
echo "Database connection loaded\n";

try {
    echo "Getting database connection...\n";
    $pdo = getDBConnection();
    echo "Connected successfully\n";
    
    // Get all users with their passwords (first few characters only for security)
    echo "Querying users...\n";
    $stmt = $pdo->query("SELECT id, username, role, SUBSTRING(password, 1, 10) as password_preview FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users with password previews:\n";
    foreach ($users as $user) {
        echo "ID: {$user['id']}, Username: {$user['username']}, Role: {$user['role']}, Password starts: {$user['password_preview']}...\n";
    }
    
    // Check if passwords are hashed
    $stmt = $pdo->prepare("SELECT password FROM users WHERE username = ?");
    $stmt->execute(['operator']);
    $operatorPassword = $stmt->fetchColumn();
    
    echo "\nOperator password: $operatorPassword\n";
    echo "Password length: " . strlen($operatorPassword) . "\n";
    echo "Is it a bcrypt hash? " . (substr($operatorPassword, 0, 4) === '$2y$' ? 'Yes' : 'No') . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
