<?php
include 'db.php';
header('Content-Type: application/json');

try {
    // 1. Temporarily change the column to VARCHAR so we can update values freely
    $conn->query("ALTER TABLE predefined_items MODIFY unit VARCHAR(10)");

    // 2. Replace any invalid values (like 'Kgs') with the correct ones
    $conn->query("UPDATE predefined_items SET unit = 'Kg' WHERE unit = 'Kgs'");

    // 3. Change the column back to ENUM with allowed values only
    $conn->query("ALTER TABLE predefined_items MODIFY unit ENUM('Kg', 'pcs')");

    echo json_encode(['success' => true, 'message' => 'Unit column successfully fixed.']);
} catch (mysqli_sql_exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
