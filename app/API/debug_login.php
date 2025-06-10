<?php
// filepath: c:\xampp\htdocs\soil\app\API\debug_login.php
header("Content-Type: text/plain");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');

echo "=== DEBUG LOGIN ===\n";

echo "Including db.php...\n";
$dbPath = __DIR__ . '/db.php';
error_log("[debug_login] Including DB file: $dbPath");
if (!file_exists($dbPath)) {
    error_log("[debug_login] DB file not found at: $dbPath");
}
require_once $dbPath;

echo "Connection status: " . ($conn ? 'SUCCESS' : 'FAILED') . "\n";
if (!$conn) {
    echo "PDO drivers available: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
    exit;
}

echo "Reading raw input...\n";
$raw = file_get_contents('php://input');
echo "Raw input: " . $raw . "\n";

$data = json_decode($raw, true);
echo "Decoded JSON: " . var_export($data, true) . "\n";

$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';
echo "Username: $user\n";
echo "Password: $pass\n";

try {
    echo "Preparing query...\n";
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    echo "Executing query...\n";
    $stmt->execute([$user]);
    $fetched = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Fetched user row: " . var_export($fetched, true) . "\n";
} catch (PDOException $e) {
    echo "Query exception: " . $e->getMessage() . "\n";
    echo "Error info: " . print_r($e->errorInfo, true) . "\n";
}
?>
