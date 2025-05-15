<?php
$host = 'localhost';
$db = 'farm_inventory';
$user = 'root'; // Update if needed
$pass = '';     // Update if needed

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>