<?php
// db.php: Database connection file

// Include the centralized configuration
require_once __DIR__ . '/config.php';

// Fetch database credentials from environment variables
$host = $_ENV['DB_HOST'];
$dbname = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

// Create a new MySQLi connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check the connection
if ($conn->connect_error) {
    if ($_ENV['APP_DEBUG'] === 'true') {
        die("Connection failed: " . $conn->connect_error);
    } else {
        die("Connection failed. Please try again later.");
    }
}
?>
