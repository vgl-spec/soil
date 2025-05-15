<?php
// Allow from any origin (or replace '*' with your specific frontend URL)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // You can whitelist specific origins like 'https://soil-indol.vercel.app' here if needed
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with 200 OK and exit early for preflight
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