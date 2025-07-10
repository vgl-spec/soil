<?php
// filepath: c:\xampp\htdocs\soil\app\API\cors.php
// Centralized CORS and error settings for all API endpoints
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');
error_reporting(E_ALL);

// Ensure clean output
ob_start();

// List of allowed origins
$allowedOrigins = [
    'https://soil-indol.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

// Get the origin of the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Set CORS headers
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback to primary production domain
    header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Log CORS headers for debugging
error_log("CORS - Origin: $origin, Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'unknown'));

// Respond to preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

?>
