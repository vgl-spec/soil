<?php
include 'db.php';

$username = 'operator1';
$password = 'op123';

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
  echo "User found. Password: " . $user['password'] . "<br>";
  if ($user['password'] === $password) {
    echo "✅ Password matches.";
  } else {
    echo "❌ Password mismatch.";
  }
} else {
  echo "❌ User not found.";
}
?>
