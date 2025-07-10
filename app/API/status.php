<?php
require_once __DIR__ . '/cors.php';
header('Content-Type: application/json');

echo json_encode([
    'status' => 'OK',
    'message' => 'API endpoints are working',
    'timestamp' => date('Y-m-d H:i:s'),
    'endpoints' => [
        'categories' => '/API/categories.php',
        'items' => '/API/items.php',
        'check_item_exists' => '/API/check_item_exists.php',
        'add_item' => '/API/add_item.php',
        'add_predefined_item' => '/API/add_predefined_item.php'
    ]
]);
?>
