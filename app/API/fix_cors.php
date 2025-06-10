<?php
// Master CORS fix script for all essential API endpoints
// This script will add CORS headers to files that don't have them

$files_to_fix = [
    'info.php',
    'phpinfo.php',
    'debug_production.php',
    'production_diagnostic.php',
    'deployment_check.php',
    'extension_check.php'
];

$cors_include = "<?php\n// Include centralized CORS and error settings\nrequire_once __DIR__ . '/cors.php';\n\n";

foreach ($files_to_fix as $file) {
    $filepath = __DIR__ . '/' . $file;
    
    if (file_exists($filepath)) {
        $content = file_get_contents($filepath);
        
        // Check if it already has CORS
        if (strpos($content, 'cors.php') === false) {
            // Check if it starts with <?php
            if (strpos($content, '<?php') === 0) {
                // Replace the opening tag with CORS include
                $content = str_replace('<?php', $cors_include, $content);
                file_put_contents($filepath, $content);
                echo "Fixed CORS for: $file\n";
            }
        } else {
            echo "Already has CORS: $file\n";
        }
    } else {
        echo "File not found: $file\n";
    }
}

echo "CORS fix complete!\n";
?>
