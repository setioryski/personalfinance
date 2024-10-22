<?php
// get_summary.php

header('Content-Type: application/json');
require_once 'db.php';

// Enable MySQLi Error Reporting for debugging (remove in production)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$start_date = isset($_POST['start_date']) ? $_POST['start_date'] : '';
$end_date = isset($_POST['end_date']) ? $_POST['end_date'] : '';
$page = isset($_POST['page']) ? intval($_POST['page']) : 1;
$items_per_page = isset($_POST['items_per_page']) ? intval($_POST['items_per_page']) : 10;

if ($start_date) {
    // Prepare parameters and types for binding
    $params = [];
    $types = '';

    // Base SQL query for transactions (without LIMIT) to fetch all transactions for balance calculation
    $sql_all_transactions = "SELECT id, transaction_date, type, amount, description FROM transactions WHERE transaction_date >= ?";
    $params_all = [$start_date];
    $types_all = 's';

    if ($end_date) {
        $sql_all_transactions .= " AND transaction_date <= ?";
        $params_all[] = $end_date;
        $types_all .= 's';
    }

    // Order by date ASC, id ASC for balance calculation
    $sql_all_transactions .= " ORDER BY transaction_date ASC, id ASC";

    // Prepare the statement for all transactions
    $stmt_all = $conn->prepare($sql_all_transactions);
    if ($stmt_all === false) {
        echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $conn->error]);
        exit();
    }

    // Bind parameters
    $stmt_all->bind_param($types_all, ...$params_all);

    // Execute the statement
    $stmt_all->execute();
    $result_all = $stmt_all->get_result();

    $all_transactions = [];
    while ($row = $result_all->fetch_assoc()) {
        $all_transactions[] = $row;
    }
    $stmt_all->close();

    // Calculate total income and total expense over the entire date range
    $sql_totals = "SELECT 
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions WHERE transaction_date >= ?";
    $params_totals = [$start_date];
    $types_totals = 's';

    if ($end_date) {
        $sql_totals .= " AND transaction_date <= ?";
        $params_totals[] = $end_date;
        $types_totals .= 's';
    }

    $stmt_totals = $conn->prepare($sql_totals);
    if ($stmt_totals === false) {
        echo json_encode(['success' => false, 'message' => 'SQL Error: ' . $conn->error]);
        exit();
    }

    // Bind parameters
    $stmt_totals->bind_param($types_totals, ...$params_totals);

    // Execute the statement
    $stmt_totals->execute();
    $result_totals = $stmt_totals->get_result();
    $totals = $result_totals->fetch_assoc();
    $stmt_totals->close();

    $total_income = $totals['total_income'] ? $totals['total_income'] : 0;
    $total_expense = $totals['total_expense'] ? $totals['total_expense'] : 0;
    $net_balance = $total_income - $total_expense;

    // Get initial balance before start date
    $stmt = $conn->prepare("SELECT SUM(CASE WHEN type='income' THEN amount ELSE -amount END) as balance FROM transactions WHERE transaction_date < ?");
    $stmt->bind_param("s", $start_date);
    $stmt->execute();
    $stmt->bind_result($initialBalance);
    $stmt->fetch();
    $stmt->close();

    if (!$initialBalance) {
        $initialBalance = 0;
    }

    // Calculate running balances
    $runningBalance = $initialBalance;

    foreach ($all_transactions as &$transaction) {
        if ($transaction['type'] == 'income') {
            $runningBalance += $transaction['amount'];
        } else {
            $runningBalance -= $transaction['amount'];
        }
        $transaction['balance'] = $runningBalance;
    }
    unset($transaction); // Break the reference

    // Reverse the transactions array to have newest to oldest
    $all_transactions_desc = array_reverse($all_transactions);

    // Total records for pagination
    $total_records = count($all_transactions_desc);

    // Slice the transactions array for pagination
    $start_index = ($page - 1) * $items_per_page;
    $paged_transactions = array_slice($all_transactions_desc, $start_index, $items_per_page);

    echo json_encode([
        'success' => true,
        'data' => [
            'start_date' => $start_date,
            'end_date' => $end_date ? $end_date : date('Y-m-d'),
            'total_income' => $total_income,
            'total_expense' => $total_expense,
            'net_balance' => $net_balance,
            'transactions' => $paged_transactions,
            'total_records' => $total_records,
            'page' => $page,
            'items_per_page' => $items_per_page
        ]
    ]);

} else {
    echo json_encode(['success' => false, 'message' => 'Start date is required.']);
}

$conn->close();
?>
