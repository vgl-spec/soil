<?php
// Preflight test endpoint
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

$response = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'preflight_headers' => [
        'access-control-request-method' => $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] ?? 'none',
        'access-control-request-headers' => $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ?? 'none'
    ],
    'sent_headers' => headers_list(),
    'status' => 'success'
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
