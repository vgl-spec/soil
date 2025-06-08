<?php
require_once 'db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection not initialized");
    }

    // Test the connection with correct PostgreSQL SSL queries
    $versionStmt = $conn->query('SELECT version()');
    $version = $versionStmt->fetch(PDO::FETCH_ASSOC);
    
    // Use the correct PostgreSQL SSL status query
    $sslStmt = $conn->query("SHOW ssl");
    $ssl = $sslStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'ssl_info' => [
            'certificate_path' => realpath(__DIR__ . '/../../certificates/root.crt'),
            'certificate_exists' => file_exists(__DIR__ . '/../../certificates/root.crt'),
            'certificate_readable' => is_readable(__DIR__ . '/../../certificates/root.crt'),
            'certificate_permissions' => substr(sprintf('%o', fileperms(__DIR__ . '/../../certificates/root.crt')), -4),
            'postgres_version' => $version['version'],
            'ssl_enabled' => $ssl['ssl'] === 'on' ? 'Yes' : 'No',
            'connection_status' => $conn->getAttribute(PDO::ATTR_CONNECTION_STATUS),
            'ssl_mode' => getenv('PGSSLMODE'),
            'ssl_cert_path' => getenv('PGSSLROOTCERT')
        ]
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'ssl_info' => [
            'certificate_path' => realpath(__DIR__ . '/../../certificates/root.crt'),
            'certificate_exists' => file_exists(__DIR__ . '/../../certificates/root.crt'),
            'certificate_readable' => is_readable(__DIR__ . '/../../certificates/root.crt'),
            'certificate_permissions' => substr(sprintf('%o', fileperms(__DIR__ . '/../../certificates/root.crt')), -4),
            'ssl_mode' => getenv('PGSSLMODE'),
            'ssl_cert_path' => getenv('PGSSLROOTCERT')
        ]
    ], JSON_PRETTY_PRINT);
}