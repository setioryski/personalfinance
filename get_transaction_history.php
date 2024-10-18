<?php
// get_transaction_history.php

header('Content-Type: application/json');
require_once 'db.php';

// Fetch last 10 transactions
$sql = "SELECT id, transaction_date, type, amount, description FROM transactions ORDER BY transaction_date DESC LIMIT 10";
$result = $conn->query($sql);

$transactions = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
}

// Calculate current balance
$balanceSql = "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance FROM transactions";
$balanceResult = $conn->query($balanceSql);
$balanceRow = $balanceResult->fetch_assoc();
$balance = $balanceRow['balance'] ? $balanceRow['balance'] : 0;

echo json_encode(['success' => true, 'data' => $transactions, 'balance' => $balance]);

$conn->close();
?>
