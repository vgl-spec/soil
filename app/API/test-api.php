<?php
header("Access-Control-Allow-Origin: https://soil-indol.vercel.app");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include 'db.php';

try {
    // Test database connection by querying PostgreSQL version
    $stmt = $conn->query('SELECT version()');
    $version = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "message" => "API is working!",
        "database" => [
            "connected" => true,
            "version" => $version['version'],
            "type" => "PostgreSQL"
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
}
