<?php
$allowedOrigins = ['https://soil-indol.vercel.app'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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

// Read input once and log raw input for debugging
$rawInput = file_get_contents("php://input");
error_log("Raw input received: " . $rawInput);

fetch('https://soil-3tik.onrender.com/API/login.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.log('Error:', error));


// Decode JSON input
$data = json_decode($rawInput, true);
if (!$data) {
    error_log("JSON decoding failed.");
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

