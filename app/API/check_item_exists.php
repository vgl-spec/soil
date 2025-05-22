<?php
// Enable error reporting for debugging - keep off in production
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log errors to file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Allowed CORS origins
$allowed_origins = [
    'https://soil-indol.vercel.app',
    'https://soil-3tik.onrender.com',
    // add your other allowed frontend domains here
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
    } else {
        header('HTTP/1.1 403 Forbidden');
        error_log("CORS error: Origin not allowed - " . $_SERVER['HTTP_ORIGIN']);
        exit('Origin not allowed');
    }
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include your database connection
include 'db.php';

if (
    isset($_GET['name']) &&
    isset($_GET['main_category_id']) &&
    isset($_GET['subcategory_id'])
) {
    $itemName = $_GET['name'];
    $category = $_GET['main_category_id'];
    $subcategory = $_GET['subcategory_id'];

    // Prepare the query to prevent SQL injection
    $query = "SELECT * FROM predefined_items WHERE main_category_id = ? AND subcat_id = ? AND name = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iis", $category, $subcategory, $itemName);
    $stmt->execute();
    $result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Debug: Log the fetched row to the PHP error log
    error_log("Fetched row: " . print_r($row, true));

    // Explicitly return only the needed fields, including 'unit'
    echo json_encode([
        "exists" => true,
        "item" => [
            "id" => $row['id'],
            "name" => $row['name'],
            "main_category_id" => $row['main_category_id'],
            "subcat_id" => $row['subcat_id'],
            "unit" => isset($row['unit']) ? $row['unit'] : "",
            // Add other fields as needed
        ]
    ]);
} else {
    // Item does not exist
    echo json_encode([
        "exists" => false
    ]);
}

$stmt->close();
$conn->close();
exit();
}
?>