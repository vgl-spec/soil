<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

// Include your database connection
require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    if (
        isset($_GET['name']) &&
        isset($_GET['main_category_id']) &&
        isset($_GET['subcategory_id'])
    ) {
        $itemName = $_GET['name'];
        $category = (int)$_GET['main_category_id'];
        $subcategory = (int)$_GET['subcategory_id'];

        error_log("Checking item exists: name='$itemName', main_category_id=$category, subcat_id=$subcategory");
        error_log("Available predefined items in database:");
        
        // Debug: List all predefined items to see what's in the database
        $debugQuery = "SELECT id, name, main_category_id, subcat_id, unit FROM predefined_items";
        $debugStmt = $conn->prepare($debugQuery);
        $debugStmt->execute();
        while ($debugRow = $debugStmt->fetch(PDO::FETCH_ASSOC)) {
            error_log("DB Item: ID=" . $debugRow['id'] . ", name='" . $debugRow['name'] . "', main_cat=" . $debugRow['main_category_id'] . ", subcat=" . $debugRow['subcat_id'] . ", unit=" . $debugRow['unit']);
        }

        // Prepare the query to prevent SQL injection (PDO version)
        $query = "SELECT * FROM predefined_items WHERE main_category_id = ? AND subcat_id = ? AND name = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$category, $subcategory, $itemName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Debug: Log the fetched row to the PHP error log
            error_log("Fetched row: " . print_r($row, true));

            // Explicitly return only the needed fields, including 'unit'
            echo json_encode([
                "exists" => true,
                "item" => [
                    "id" => (int)$row['id'],
                    "name" => $row['name'],
                    "main_category_id" => (int)$row['main_category_id'],
                    "subcat_id" => (int)$row['subcat_id'],
                    "unit" => $row['unit'] ?? "",
                ]
            ]);
        } else {
            // Item does not exist
            error_log("Item not found in predefined_items");
            echo json_encode([
                "exists" => false
            ]);
        }
    } else {
        throw new Exception("Missing required parameters: name, main_category_id, subcategory_id");
    }
} catch (Exception $e) {
    error_log("API Error in check_item_exists.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}

exit;
?>
?>