<?php
include 'db.php';

// ALTER the 'unit' column in predefined_items to allow 'Kg' and 'pcs'
$sql = "ALTER TABLE predefined_items MODIFY unit ENUM('Kg', 'pcs')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true, 'message' => "Column updated successfully."]);
} else {
    echo json_encode(['success' => false, 'message' => $conn->error]);
}
?>
