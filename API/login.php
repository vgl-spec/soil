<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with 200 OK and exit early for preflight
    http_response_code(200);
    exit();
}


session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'db.php';

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
error_log("Raw input received: " . file_get_contents("php://input")); // Debug log
if (!$data) {
    error_log("JSON decoding failed."); // Debug log
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
    exit;
}

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    // If you store hashed passwords, use password_verify($password, $user['password'])
    if ($user['password'] === $password) {
        $_SESSION['user'] = $user;
        $log = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description) VALUES (?, 'login', 'User logged in')");
        $log->bind_param("i", $user['id']);
        $log->execute();
        echo json_encode(["success" => true, "role" => $user['role'], "id" => $user['id']]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}
?>

