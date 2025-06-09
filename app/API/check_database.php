<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting database check...\n";
require_once 'db.php';
echo "db.php loaded\n";

try {
    $pdo = getDBConnection();
    echo "Database connection successful\n";
      // Check if users table exists (PostgreSQL syntax)
    $stmt = $pdo->query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')");
    $tableExists = $stmt->fetchColumn();
    
    if ($tableExists) {
        echo "Users table exists\n";
          // Get table structure (PostgreSQL syntax)
        $stmt = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Table structure:\n";
        foreach ($columns as $column) {
            echo "- {$column['column_name']} ({$column['data_type']})\n";
        }
        
        // Count users
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Number of users: {$count['count']}\n";
        
        // Get all users
        $stmt = $pdo->query("SELECT id, username, role FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Users in database:\n";
        foreach ($users as $user) {
            echo "ID: {$user['id']}, Username: {$user['username']}, Role: {$user['role']}\n";
        }
    } else {
        echo "Users table does not exist\n";
          // Show all tables (PostgreSQL syntax)
        $stmt = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Available tables:\n";
        foreach ($tables as $table) {
            echo "- $table\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
