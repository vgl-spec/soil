<?php
// Include centralized CORS and error settings
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    echo json_encode(['status' => 'Starting sequence fix...']) . "\n";
    
    // First, let's check the current state
    $checkQuery = "SELECT MAX(id) as max_id FROM predefined_items";
    $stmt = $conn->query($checkQuery);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $maxId = $result['max_id'] ?? 0;
    
    echo json_encode(['current_max_id' => $maxId]) . "\n";
    
    // Get the current sequence value
    $seqQuery = "SELECT nextval('predefined_items_id_seq') as current_seq";
    $stmt = $conn->query($seqQuery);
    $seqResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $currentSeq = $seqResult['current_seq'] ?? 0;
    
    echo json_encode(['current_sequence_value' => $currentSeq]) . "\n";
    
    // Reset the sequence to be higher than the max ID
    $newSeqValue = $maxId + 1;
    $resetQuery = "SELECT setval('predefined_items_id_seq', $newSeqValue, false)";
    $conn->query($resetQuery);
    
    echo json_encode(['sequence_reset_to' => $newSeqValue]) . "\n";
    
    // Verify the fix
    $verifyQuery = "SELECT nextval('predefined_items_id_seq') as new_seq";
    $stmt = $conn->query($verifyQuery);
    $verifyResult = $stmt->fetch(PDO::FETCH_ASSOC);
    $newSeq = $verifyResult['new_seq'] ?? 0;
    
    echo json_encode([
        'success' => true,
        'message' => 'Sequence fixed successfully',
        'old_max_id' => $maxId,
        'old_sequence' => $currentSeq,
        'new_sequence' => $newSeq,
        'next_available_id' => $newSeq
    ]) . "\n";

} catch (Exception $e) {
    error_log("API Error in fix_sequence.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]) . "\n";
}
?>
