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

// Fetch the last 'count' transactions, ordered by date descending and id descending
$stmt = $conn->prepare("SELECT id, transaction_date, type, amount, description FROM transactions ORDER BY transaction_date DESC, id DESC LIMIT ?");
$stmt->bind_param("i", $count);
$stmt->execute();
$result = $stmt->get_result();

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

$stmt->close();
$conn->close();
?>
