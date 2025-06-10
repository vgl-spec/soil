<?php
// Suppress HTML errors and enable logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');
error_reporting(E_ALL);

// CORS - allow any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Include the database connection file using absolute path to avoid include_path issues
$dbFile = __DIR__ . '/db.php';
error_log("Including DB file: $dbFile");
if (!file_exists($dbFile)) {
    error_log("DB file not found at: $dbFile");
}
require_once $dbFile;

// Debug connection status
error_log("Connection status in login.php: " . ($conn ? "SUCCESS" : "FAILED"));
if (!$conn) {
    error_log("Database connection failed in login.php - connection is null");
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Read input once and log raw input for debugging
$rawInput = file_get_contents("php://input");
error_log("Raw input received: " . $rawInput);  // Log the raw input data

// Check if the input is empty
if (empty($rawInput)) {
    echo json_encode(["success" => false, "message" => "No input received"]);
    exit;
}

// Decode JSON input
$data = json_decode($rawInput, true);
if (!$data) {
    error_log("JSON decoding failed.");
    echo json_encode(["success" => false, "message" => "Invalid JSON", "raw_input" => $rawInput]);
    exit;
}

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["success" => false, "message" => "Missing credentials"]);
    exit;
}

try {
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);    if ($user) {
        $passwordValid = false;
        
        // Check if password is hashed (bcrypt format)
        if (password_get_info($user['password'])['algo']) {
            // Password is hashed, use password_verify
            $passwordValid = password_verify($password, $user['password']);
        } else {
            // Password is plain text, compare directly (temporary fallback)
            $passwordValid = ($password === $user['password']);
            
            // If plain text password matches, hash it for future use
            if ($passwordValid) {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $updateStmt->execute([$hashedPassword, $user['id']]);
                error_log("Auto-hashed password for user: " . $user['username']);
            }
        }
        
        if ($passwordValid) {
            $_SESSION['user'] = $user;

            $log = $conn->prepare("INSERT INTO action_logs (user_id, action_type, description) VALUES (?, ?, ?)");
            $log->execute([$user['id'], 'login', 'User logged in']);

            echo json_encode(["success" => true, "role" => $user['role'], "id" => $user['id']]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
} catch (PDOException $e) {
    error_log("Database error in login.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
} catch (Exception $e) {
    error_log("General error in login.php: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "An error occurred"]);
}
?>
