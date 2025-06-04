<?php
include 'app/API/db.php';

// Check units in predefined_items table
echo "=== PREDEFINED ITEMS UNITS ===\n";
$query = "SELECT DISTINCT unit FROM predefined_items ORDER BY unit";
$result = $conn->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo "Unit: '" . $row['unit'] . "'\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}

echo "\n=== SAMPLE PREDEFINED ITEMS ===\n";
$query = "SELECT name, unit FROM predefined_items LIMIT 10";
$result = $conn->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        echo "Name: " . $row['name'] . ", Unit: '" . $row['unit'] . "'\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}

$conn->close();
?>
