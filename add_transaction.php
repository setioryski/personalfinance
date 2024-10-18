<?php
// add_transaction.php
header('Content-Type: application/json');
require 'db.php'; // Include the database connection

$response = ['success' => false, 'message' => ''];

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize form inputs
    $transaction_date = $_POST['date'] ?? '';
    $type = $_POST['type'] ?? '';
    $amount = $_POST['amount'] ?? '';
    $description = trim($_POST['description'] ?? '');

    // Basic validation
    $errors = [];

    // Validate date
    if (!DateTime::createFromFormat('Y-m-d', $transaction_date)) {
        $errors[] = "Invalid date format.";
    }

    // Validate type
    if (!in_array($type, ['income', 'expense'])) {
        $errors[] = "Invalid transaction type.";
    }

    // Validate amount
    if (!is_numeric($amount) || $amount <= 0) {
        $errors[] = "Amount must be a positive number.";
    }

    // If there are errors, return them
    if (!empty($errors)) {
        $response['message'] = implode(' ', $errors);
        echo json_encode($response);
        exit();
    }

    // Prepare and bind the SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO transactions (transaction_date, type, amount, description) VALUES (?, ?, ?, ?)");
    if ($stmt === false) {
        $response['message'] = "Database error: " . htmlspecialchars($conn->error);
        echo json_encode($response);
        exit();
    }

    $stmt->bind_param("ssds", $transaction_date, $type, $amount, $description);

    // Execute the statement
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Transaction added successfully!";
    } else {
        $response['message'] = "Error: " . htmlspecialchars($stmt->error);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
?>
