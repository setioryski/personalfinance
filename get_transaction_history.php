<?php
// get_transaction_history.php

header('Content-Type: application/json');
require_once 'db.php'; // Include your database connection

// Get the 'count' parameter from GET request, default to 10
$count = isset($_GET['count']) ? intval($_GET['count']) : 10;

// Validate count (ensure it's either 10 or 50)
if ($count !== 10 && $count !== 50) {
    $count = 10; // Default to 10 if invalid
}

// Fetch the last 'count' transactions, ordered by date and id descending
$stmt = $conn->prepare("SELECT id, transaction_date, type, amount, description FROM transactions ORDER BY transaction_date DESC, id DESC LIMIT ?");
$stmt->bind_param("i", $count);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
}

// Calculate current balance
$balanceSql = "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance FROM transactions";
$balanceResult = $conn->query($balanceSql);
$balanceRow = $balanceResult->fetch_assoc();
$currentBalance = $balanceRow['balance'] ? $balanceRow['balance'] : 0;

// Compute the cumulative balance before the earliest transaction
if (count($transactions) > 0) {
    $lastTransaction = end($transactions);
    $earliestDate = $lastTransaction['transaction_date'];
    $earliestId = $lastTransaction['id'];

    // Prepare the statement to compute cumulative balance before earliest transaction
    $balanceStmt = $conn->prepare("SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance FROM transactions WHERE transaction_date < ? OR (transaction_date = ? AND id < ?)");
    $balanceStmt->bind_param("ssi", $earliestDate, $earliestDate, $earliestId);
    $balanceStmt->execute();
    $balanceResult = $balanceStmt->get_result();
    $balanceRow = $balanceResult->fetch_assoc();
    $initialBalance = $balanceRow['balance'] ? $balanceRow['balance'] : 0;
    $balanceStmt->close();
} else {
    $initialBalance = 0;
}

$transactions = array_reverse($transactions); // Reverse to chronological order

$runningBalance = $initialBalance;

foreach ($transactions as &$transaction) {
    if ($transaction['type'] == 'income') {
        $runningBalance += $transaction['amount'];
    } else {
        $runningBalance -= $transaction['amount'];
    }
    $transaction['balance'] = $runningBalance;
}
unset($transaction); // Break the reference with the last element

$transactions = array_reverse($transactions); // Reverse back to original order

echo json_encode(['success' => true, 'data' => $transactions, 'current_balance' => $currentBalance]);

$stmt->close();
$conn->close();
?>
