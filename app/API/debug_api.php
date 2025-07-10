<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

// Simple test endpoint to check if basic functionality works
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'API is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'pdo_available' => extension_loaded('pdo'),
    'pdo_pgsql_available' => extension_loaded('pdo_pgsql'),
    'server_info' => $_SERVER['HTTP_HOST'] ?? 'unknown'
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
