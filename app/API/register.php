<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

include 'db.php';
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Read the input data
    $inputData = json_decode(file_get_contents('php://input'), true);

    // Validate input data
    if (empty($inputData['username']) || empty($inputData['email']) || empty($inputData['password']) || empty($inputData['contact']) || empty($inputData['subdivision'])) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit();
    }

    $username = $inputData['username'];
    $email = $inputData['email'];
    $password = password_hash($inputData['password'], PASSWORD_DEFAULT); // Encrypt the password
    $contact = $inputData['contact'];
    $subdivision = $inputData['subdivision'];
    $role = isset($inputData['role']) ? $inputData['role'] : 'user'; // Default to 'user' if not specified    // Check if the username or email already exists
    $checkUserQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    $stmt = $conn->prepare($checkUserQuery);
    $stmt->execute([$username, $email]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists.']);
        exit();
    }

    // Insert new user into the database (let ID auto-increment)
    $insertQuery = "INSERT INTO users (username, email, password, contact, subdivision, role) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    
    if ($stmt->execute([$username, $email, $password, $contact, $subdivision, $role])) {
        // Get the newly created user ID
        $userId = $conn->lastInsertId();
        echo json_encode([
            'success' => true, 
            'message' => 'Registration successful.',
            'user_id' => $userId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
