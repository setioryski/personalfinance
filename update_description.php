<?php
// update_description.php

header('Content-Type: application/json');
require_once 'db.php'; // Include your database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $transaction_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    if ($transaction_id > 0) {
        // Prepare and execute the update query
        $stmt = $conn->prepare("UPDATE transactions SET description = ? WHERE id = ?");
        $stmt->bind_param("si", $description, $transaction_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Description updated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update description.']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid transaction ID.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
?>
