<?php
include 'db.php';

$username = 'operator1';
$password = 'op123';

try {
    // Use PostgreSQL parameterized query
    $sql = "SELECT * FROM users WHERE username = $1";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$username]);
    
    // PDO fetch
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo "User found. Password: " . $user['password'] . "<br>";
        if ($user['password'] === $password) {
            echo "✅ Password matches.";
        } else {
            echo "❌ Password mismatch.";
        }
    } else {
        echo "❌ User not found.";
    }
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>
