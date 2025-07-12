<?php
header('Content-Type: text/plain');

echo "=== PHP Error Log Viewer ===\n";
echo "Timestamp: " . date('Y-m-d H:i:s') . "\n\n";

$logPaths = [
    __DIR__ . '/php_errors.log',
    __DIR__ . '/app/API/php_errors.log',
    'C:/xampp/php/logs/php_error_log',
    'C:/xampp/apache/logs/error.log'
];

foreach ($logPaths as $logPath) {
    echo "Checking: $logPath\n";
    if (file_exists($logPath)) {
        echo "✅ Found log file: $logPath\n";
        echo "Size: " . filesize($logPath) . " bytes\n";
        echo "Last modified: " . date('Y-m-d H:i:s', filemtime($logPath)) . "\n\n";
        
        echo "=== Last 20 lines ===\n";
        $lines = file($logPath);
        if ($lines) {
            $lastLines = array_slice($lines, -20);
            foreach ($lastLines as $line) {
                echo $line;
            }
        } else {
            echo "Could not read file\n";
        }
        echo "\n" . str_repeat("=", 50) . "\n\n";
    } else {
        echo "❌ Not found: $logPath\n\n";
    }
}

// Also check for any recent PHP errors
echo "=== Current PHP Configuration ===\n";
echo "Error reporting: " . error_reporting() . "\n";
echo "Display errors: " . ini_get('display_errors') . "\n";
echo "Log errors: " . ini_get('log_errors') . "\n";
echo "Error log: " . ini_get('error_log') . "\n";
echo "Max execution time: " . ini_get('max_execution_time') . "\n";
echo "Memory limit: " . ini_get('memory_limit') . "\n";

echo "\n=== PHP Extensions ===\n";
echo "PDO: " . (extension_loaded('pdo') ? 'YES' : 'NO') . "\n";
echo "PDO_PGSQL: " . (extension_loaded('pdo_pgsql') ? 'YES' : 'NO') . "\n";
echo "JSON: " . (extension_loaded('json') ? 'YES' : 'NO') . "\n";
echo "CURL: " . (extension_loaded('curl') ? 'YES' : 'NO') . "\n";
?>
