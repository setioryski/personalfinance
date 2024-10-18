<?php
// db.php: Database connection file

$host = 'localhost';            // Change if your database host is different
$dbname = 'finance_tracker';    // Database name
$user = 'root';                 // Your MySQL username
$pass = '';                     // Your MySQL password

// Create a new MySQLi connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
