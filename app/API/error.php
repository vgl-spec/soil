<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

$error_code = $_SERVER['REDIRECT_STATUS'] ?? 500;
$error_message = match($error_code) {
    404 => 'API endpoint not found',
    500 => 'Internal server error',
    default => 'An error occurred'
};

http_response_code($error_code);
header('Content-Type: application/json');

echo json_encode([
    'success' => false,
    'error' => $error_message,
    'code' => $error_code
]);
?>
