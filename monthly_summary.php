<?php
// get_summary.php
header('Content-Type: application/json');
require 'db.php'; // Include the database connection

$response = ['success' => false, 'data' => null, 'message' => ''];

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize input dates
    $start_date = $_POST['start_date'] ?? '';
    $end_date = $_POST['end_date'] ?? '';

    // Validate start_date
    if (!DateTime::createFromFormat('Y-m-d', $start_date)) {
        $response['message'] = "Invalid start date format.";
        echo json_encode($response);
        exit();
    }

    // Validate end_date if provided
    if (!empty($end_date)) {
        if (!DateTime::createFromFormat('Y-m-d', $end_date)) {
            $response['message'] = "Invalid end date format.";
            echo json_encode($response);
            exit();
        }
        if ($start_date > $end_date) {
            $response['message'] = "Start date cannot be later than end date.";
            echo json_encode($response);
            exit();
        }
    } else {
        // If end_date is not provided, set it to tomorrow's date
        $tomorrow = new DateTime();
        $tomorrow->modify('+1 day');
        $end_date = $tomorrow->format('Y-m-d');
    }

    // Initialize variables
    $total_income = 0;
    $total_expense = 0;
    $transactions = [];

    // Begin transaction for consistency
    $conn->begin_transaction();

    try {
        // Total Income
        $stmt_income = $conn->prepare("SELECT SUM(amount) AS total_income FROM transactions 
                                       WHERE type='income' AND transaction_date BETWEEN ? AND ?");
        if ($stmt_income === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }
        $stmt_income->bind_param("ss", $start_date, $end_date);
        $stmt_income->execute();
        $result_income = $stmt_income->get_result();
        $total_income = $result_income->fetch_assoc()['total_income'];
        $total_income = $total_income ? $total_income : 0;
        $stmt_income->close();

        // Total Expenses
        $stmt_expense = $conn->prepare("SELECT SUM(amount) AS total_expense FROM transactions 
                                        WHERE type='expense' AND transaction_date BETWEEN ? AND ?");
        if ($stmt_expense === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }
        $stmt_expense->bind_param("ss", $start_date, $end_date);
        $stmt_expense->execute();
        $result_expense = $stmt_expense->get_result();
        $total_expense = $result_expense->fetch_assoc()['total_expense'];
        $total_expense = $total_expense ? $total_expense : 0;
        $stmt_expense->close();

        // Net Balance
        $net_balance = $total_income - $total_expense;

        // Retrieve all transactions within the date range
        $stmt_transactions = $conn->prepare("SELECT transaction_date, type, amount, description 
                                            FROM transactions 
                                            WHERE transaction_date BETWEEN ? AND ?
                                            ORDER BY transaction_date DESC, id DESC");
        if ($stmt_transactions === false) {
            throw new Exception("Database error: " . htmlspecialchars($conn->error));
        }
        $stmt_transactions->bind_param("ss", $start_date, $end_date);
        $stmt_transactions->execute();
        $result_transactions = $stmt_transactions->get_result();

        while ($row = $result_transactions->fetch_assoc()) {
            // Convert amount to selected currency
            $converted_amount = $row['amount'] * $rate;
            $transactions[] = [
                'transaction_date' => $row['transaction_date'],
                'type' => ucfirst($row['type']),
                'amount' => number_format($converted_amount, 2),
                'description' => htmlspecialchars($row['description'])
            ];
        }
        $stmt_transactions->close();

        // Commit transaction
        $conn->commit();

        // Prepare data
        $data = [
            'start_date' => $start_date,
            'end_date' => $end_date,
            'total_income' => number_format($total_income * $rate, 2),
            'total_expense' => number_format($total_expense * $rate, 2),
            'net_balance' => number_format($net_balance * $rate, 2),
            'transactions' => $transactions,
            'currency' => $selected_currency,
            'currency_symbol' => $currency_symbol
        ];

        $response['success'] = true;
        $response['data'] = $data;

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
