<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

// PostgreSQL PDO Extension Verification Script
// Move in the root directory of your web server C:\xampp\htdocs\soil\app\API
// **DELETE THIS FILE AFTER VERIFICATION FOR SECURITY**

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>PostgreSQL PDO Verification</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .section { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>🔍 PostgreSQL PDO Extension Verification</h1>
    
    <div class="section">
        <h2>📋 Quick Check Results</h2>
        <?php
        $pdo_loaded = extension_loaded('pdo');
        $pgsql_loaded = extension_loaded('pdo_pgsql');
        $drivers = class_exists('PDO') ? PDO::getAvailableDrivers() : [];
        $pgsql_driver = in_array('pgsql', $drivers);
        
        echo "<p>PDO Extension: " . ($pdo_loaded ? "<span class='success'>✅ LOADED</span>" : "<span class='error'>❌ NOT LOADED</span>") . "</p>";
        echo "<p>PDO PostgreSQL Extension: " . ($pgsql_loaded ? "<span class='success'>✅ LOADED</span>" : "<span class='error'>❌ NOT LOADED</span>") . "</p>";
        echo "<p>PostgreSQL Driver Available: " . ($pgsql_driver ? "<span class='success'>✅ YES</span>" : "<span class='error'>❌ NO</span>") . "</p>";
        echo "<p>Available PDO Drivers: " . implode(', ', $drivers) . "</p>";
        
        if ($pdo_loaded && $pgsql_loaded && $pgsql_driver) {
            echo "<div class='success'><h3>🎉 SUCCESS: PostgreSQL PDO is fully configured!</h3></div>";
        } else {
            echo "<div class='error'><h3>❌ ISSUE: PostgreSQL PDO is not properly configured</h3></div>";
        }
        ?>
    </div>
    
    <div class="section">
        <h2>🔧 Environment Information</h2>
        <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
        <p><strong>Server:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></p>
        <p><strong>Date:</strong> <?php echo date('Y-m-d H:i:s T'); ?></p>
    </div>
    
    <div class="section">
        <h2>📖 Full PHP Info</h2>
        <details>
            <summary>Click to view complete phpinfo() output</summary>
            <?php phpinfo(); ?>
        </details>
    </div>
    
    <div class="warning">
        <h3>⚠️ SECURITY WARNING</h3>
        <p><strong>Delete this file immediately after verification!</strong></p>
        <p>This file exposes sensitive server information.</p>
    </div>
</body>
</html>
