<?php
$host = getenv('DB_HOST') ?: 'RAILWAY_PRIVATE_DOMAIN';
$port = getenv('DB_PORT') ?: 3306;
$user = getenv('DB_USERNAME') ?: 'root';
$pass = getenv('DB_PASSWORD') ?: 'HOgVtsHhOCqZnxKnLduYajSlPixVczEp';
$db = getenv('DB_NAME') ?: 'MYSQL_DATABASE';

// Use correct variable names here
$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
