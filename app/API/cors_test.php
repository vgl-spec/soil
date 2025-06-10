<?php
// CORS Test endpoint - helps debug CORS issues
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

// Log request details for debugging
$requestMethod = $_SERVER['REQUEST_METHOD'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'not provided';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'not provided';

error_log("CORS Test - Method: $requestMethod, Origin: $origin");

$response = [
    'success' => true,
    'message' => 'CORS test successful',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'method' => $requestMethod,
        'origin' => $origin,
        'user_agent' => substr($userAgent, 0, 100),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'php_version' => PHP_VERSION
    ],
    'headers_sent' => [
        'Access-Control-Allow-Origin' => 'https://soil-indol.vercel.app',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
