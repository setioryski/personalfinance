<?php
// update_amount.php
header('Content-Type: application/json');
require 'db.php'; // Include your database connection

$response = ['success' => false, 'message' => ''];

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize form inputs
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;
    $type = isset($_POST['type']) ? $_POST['type'] : '';

    // Basic validation
    if ($id <= 0) {
        $response['message'] = 'Invalid transaction ID.';
        echo json_encode($response);
        exit();
    }

    if ($amount <= 0) {
        $response['message'] = 'Amount must be a positive number.';
        echo json_encode($response);
        exit();
    }

    if (!in_array($type, ['income', 'expense'])) {
        $response['message'] = 'Invalid transaction type.';
        echo json_encode($response);
        exit();
    }

    // Update the transaction amount
    $stmt = $conn->prepare("UPDATE transactions SET amount = ? WHERE id = ?");
    if ($stmt === false) {
        $response['message'] = 'Database error: ' . htmlspecialchars($conn->error);
        echo json_encode($response);
        exit();
    }

    $stmt->bind_param("di", $amount, $id);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Amount updated successfully.';
    } else {
        $response['message'] = 'Error: ' . htmlspecialchars($stmt->error);
    }

    $stmt->close();

    // **Recalculate Running Balances (Optional but Recommended)**
    // Depending on your application logic, you might need to recalculate running balances here
    // For simplicity, we're assuming the balances will be recalculated when the data is fetched

    $conn->close();
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>
