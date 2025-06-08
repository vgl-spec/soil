<?php
require_once 'db.php';

echo "\nEnvironment Check:\n";
echo "Current Directory: " . __DIR__ . "\n";
echo "Certificate Path: " . $sslCertPath . "\n";
echo "PGSSLMODE: " . getenv('PGSSLMODE') . "\n";
echo "PGSSLROOTCERT: " . getenv('PGSSLROOTCERT') . "\n\n";

echo "File System Check:\n";
echo "Certificate exists: " . (file_exists($sslCertPath) ? 'Yes' : 'No') . "\n";
echo "Certificate readable: " . (is_readable($sslCertPath) ? 'Yes' : 'No') . "\n";
if (file_exists($sslCertPath)) {
    echo "Certificate permissions: " . substr(sprintf('%o', fileperms($sslCertPath)), -4) . "\n";
    echo "Certificate content sample: \n";
    echo substr(file_get_contents($sslCertPath), 0, 100) . "...\n";
}
