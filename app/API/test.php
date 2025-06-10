<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

// Simple deployment test endpoint
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'API is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'php_version' => PHP_VERSION,
    'extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_pgsql' => extension_loaded('pdo_pgsql'),
        'json' => extension_loaded('json')
    ],
    'cors_headers' => [
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
