<?php
// get_transaction_history.php
header('Content-Type: application/json');
require 'db.php'; // Include the database connection

$response = ['success' => false, 'data' => null, 'balance' => 0, 'message' => ''];

// Check if the request method is GET (since no filters are needed)
if ($_SERVER["REQUEST_METHOD"] == "GET") {

    // Initialize variables
    $transactions = [];
    $total_income = 0;
    $total_expense = 0;

    // Begin transaction for consistency
    $conn->begin_transaction();

    try {
        // Fetch the last 10 transactions
        $stmt_transactions = $conn->prepare("SELECT * FROM transactions ORDER BY transaction_date DESC, id DESC LIMIT 10");

        if ($stmt_transactions === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }

        // Execute and fetch results
        $stmt_transactions->execute();
        $result_transactions = $stmt_transactions->get_result();

        while ($row = $result_transactions->fetch_assoc()) {
            $transactions[] = [
                'transaction_date' => $row['transaction_date'],
                'type' => ucfirst($row['type']),
                'amount' => $row['amount'], // Send raw amount
                'description' => htmlspecialchars($row['description'])
            ];
        }
        $stmt_transactions->close();

        // Calculate total income
        $stmt_income = $conn->prepare("SELECT SUM(amount) AS total_income FROM transactions WHERE type='income'");
        if ($stmt_income === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }
        $stmt_income->execute();
        $result_income = $stmt_income->get_result();
        $total_income = $result_income->fetch_assoc()['total_income'];
        $total_income = $total_income ? $total_income : 0;
        $stmt_income->close();

        // Calculate total expenses
        $stmt_expense = $conn->prepare("SELECT SUM(amount) AS total_expense FROM transactions WHERE type='expense'");
        if ($stmt_expense === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }
        $stmt_expense->execute();
        $result_expense = $stmt_expense->get_result();
        $total_expense = $result_expense->fetch_assoc()['total_expense'];
        $total_expense = $total_expense ? $total_expense : 0;
        $stmt_expense->close();

        // Calculate current balance
        $current_balance = $total_income - $total_expense;

        // Commit transaction
        $conn->commit();

        $response['success'] = true;
        $response['data'] = $transactions;
        $response['balance'] = $current_balance; // Send raw balance

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        $response['message'] = $e->getMessage();
    }

    // Close connection
    $conn->close();
} else {
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
?>
