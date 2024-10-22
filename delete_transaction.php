<?php
// delete_transaction.php

header('Content-Type: application/json');
require_once 'db.php';

if(isset($_POST['id'])) {
    $transaction_id = intval($_POST['id']);

    // Prepare the DELETE statement
    $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ?");
    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
        exit();
    }

    $stmt->bind_param("i", $transaction_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Transaction deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete transaction.']);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}

$conn->close();
?>
