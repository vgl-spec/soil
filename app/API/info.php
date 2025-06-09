<?php
// SECURITY WARNING: DELETE THIS FILE AFTER VERIFICATION
// This file contains sensitive server information

echo "<h1>PHP Configuration Check</h1>";
echo "<h2>PostgreSQL PDO Status</h2>";

// Check if PDO is enabled
if (class_exists('PDO')) {
    echo "<p style='color: green;'>✅ PDO support: ENABLED</p>";
    
    // Check available drivers
    $drivers = PDO::getAvailableDrivers();
    echo "<p>Available PDO drivers: " . implode(', ', $drivers) . "</p>";
    
    // Check specifically for PostgreSQL
    if (in_array('pgsql', $drivers)) {
        echo "<p style='color: green;'>✅ PostgreSQL PDO driver: ENABLED</p>";
    } else {
        echo "<p style='color: red;'>❌ PostgreSQL PDO driver: NOT FOUND</p>";
    }
} else {
    echo "<p style='color: red;'>❌ PDO support: NOT ENABLED</p>";
}

// Check loaded extensions
echo "<h2>Loaded Extensions</h2>";
$extensions = ['pdo', 'pdo_pgsql'];
foreach ($extensions as $ext) {
    $loaded = extension_loaded($ext);
    $status = $loaded ? 'ENABLED' : 'NOT LOADED';
    $color = $loaded ? 'green' : 'red';
    $icon = $loaded ? '✅' : '❌';
    echo "<p style='color: $color;'>$icon $ext: $status</p>";
}

echo "<hr>";
echo "<h2>Full PHP Configuration</h2>";
phpinfo();
?>
