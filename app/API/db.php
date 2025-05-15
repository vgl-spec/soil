<?php
$host = getenv('MYSQLHOST') ?: 'switchyard.proxy.rlwy.net';
$port = getenv('MYSQLPORT') ?: 52840;
$user = getenv('MYSQLUSER') ?: 'root';
$pass = getenv('MYSQLPASSWORD') ?: 'HOgVtsHhOCqZnxKnLduYajSlPixVczEp';
$db = getenv('MYSQLDATABASE') ?: 'railway';

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>
