<?php
// Simple test script to debug the add_predefined_item.php endpoint

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Test data - you'll need to replace these with actual IDs from your database
$testData = [
    'main_category_id' => 1, // Replace with actual category ID
    'subcat_id' => 1,        // Replace with actual subcategory ID
    'name' => 'Test Item ' . time(),
    'unit' => 'kg'
];

echo "Testing add_predefined_item.php with data:\n";
print_r($testData);
echo "\n";

// Send request to the API
$url = 'https://soil-3tik.onrender.com/API/add_predefined_item.php';
$postData = json_encode($testData);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($postData)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($curlError) {
    echo "cURL Error: $curlError\n";
}
echo "Response: $response\n";

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo "Parsed Response:\n";
        print_r($responseData);
    }
} else {
    echo "Request failed with HTTP code: $httpCode\n";
}
?>
