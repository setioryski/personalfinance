<?php
// delete_all.php
header('Content-Type: application/json');
require 'db.php'; // Include the database connection

$response = ['success' => false, 'message' => ''];

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Optional: Implement authentication or authorization checks here

    // Prepare the SQL statement to truncate the table
    if ($conn->query("TRUNCATE TABLE transactions")) {
        $response['success'] = true;
        $response['message'] = "All transactions have been deleted successfully.";
    } else {
        $response['message'] = "Failed to delete transactions: " . htmlspecialchars($conn->error);
    }

    $conn->close();
} else {
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
?>
