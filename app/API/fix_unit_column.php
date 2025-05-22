<?php
include 'db.php';
header('Content-Type: application/json');

// Step 1: Update any invalid values in the `unit` column
$update = "UPDATE predefined_items SET unit = 'Kg' WHERE unit = 'Kgs'";
if (!$conn->query($update)) {
    echo json_encode(['success' => false, 'step' => 1, 'message' => $conn->error]);
    exit;
}

// Step 2: Modify the `unit` column to ENUM('Kg', 'pcs')
$alter = "ALTER TABLE predefined_items MODIFY unit ENUM('Kg', 'pcs')";
if (!$conn->query($alter)) {
    echo json_encode(['success' => false, 'step' => 2, 'message' => $conn->error]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Unit column successfully updated.']);
