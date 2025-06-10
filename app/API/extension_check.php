<?php
header('Content-Type: text/plain');

echo "=== PHP EXTENSION CHECK ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "PHP Version: " . phpversion() . "\n";

echo "\n=== PDO DRIVERS ===\n";
if (class_exists('PDO')) {
    echo "PDO class exists: YES\n";
    $drivers = PDO::getAvailableDrivers();
    echo "Available drivers: " . implode(', ', $drivers) . "\n";
    echo "PostgreSQL driver: " . (in_array('pgsql', $drivers) ? 'YES' : 'NO') . "\n";
} else {
    echo "PDO class exists: NO\n";
}

echo "\n=== LOADED EXTENSIONS ===\n";
$extensions = get_loaded_extensions();
echo "Total extensions: " . count($extensions) . "\n";
echo "pdo: " . (in_array('pdo', $extensions) ? 'YES' : 'NO') . "\n";
echo "pdo_pgsql: " . (in_array('pdo_pgsql', $extensions) ? 'YES' : 'NO') . "\n";
echo "pdo_mysql: " . (in_array('pdo_mysql', $extensions) ? 'YES' : 'NO') . "\n";
echo "pdo_sqlite: " . (in_array('pdo_sqlite', $extensions) ? 'YES' : 'NO') . "\n";

echo "\n=== DEPLOYMENT CHECK ===\n";
echo "Composer.json exists: " . (file_exists('composer.json') ? 'YES' : 'NO') . "\n";
echo "Render.yaml exists: " . (file_exists('render.yaml') ? 'YES' : 'NO') . "\n";
echo ".user.ini exists: " . (file_exists('.user.ini') ? 'YES' : 'NO') . "\n";

if (file_exists('.user.ini')) {
    echo "\n.user.ini contents:\n";
    echo file_get_contents('.user.ini');
}

echo "\n=== END CHECK ===\n";
?>
