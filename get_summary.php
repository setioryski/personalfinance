<?php
// get_summary.php

header('Content-Type: application/json');
require_once 'db.php';

$start_date = isset($_POST['start_date']) ? $_POST['start_date'] : '';
$end_date = isset($_POST['end_date']) ? $_POST['end_date'] : '';

if ($start_date) {
    // Prepare and execute the query
    $params = [];
    $sql = "SELECT id, transaction_date, type, amount, description FROM transactions WHERE transaction_date >= ?";
    $params[] = $start_date;

    if ($end_date) {
        $sql .= " AND transaction_date <= ?";
        $params[] = $end_date;
    }

    // Append ORDER BY clause for descending order by date and id
    $sql .= " ORDER BY transaction_date DESC, id DESC";

    $stmt = $conn->prepare($sql);

    if ($end_date) {
        $stmt->bind_param("ss", $params[0], $params[1]);
    } else {
        $stmt->bind_param("s", $params[0]);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $transactions = [];

    $total_income = 0;
    $total_expense = 0;

    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;

        if ($row['type'] == 'income') {
            $total_income += $row['amount'];
        } else {
            $total_expense += $row['amount'];
        }
    }

    $net_balance = $total_income - $total_expense;

    echo json_encode([
        'success' => true,
        'data' => [
            'start_date' => $start_date,
            'end_date' => $end_date ? $end_date : date('Y-m-d'),
            'total_income' => $total_income,
            'total_expense' => $total_expense,
            'net_balance' => $net_balance,
            'transactions' => $transactions
        ]
    ]);

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Start date is required.']);
}

$conn->close();
?>
