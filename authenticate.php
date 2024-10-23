<?php
// authenticate.php
require_once 'config.php'; // Include centralized configuration

// Hardcoded username and password for simplicity (in production, use a database)
$correct_username = 'user';
$correct_password = '2143';

// Get the form input
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

// Basic input validation
if (empty($username) || empty($password)) {
    header('Location: login.php?error=empty_fields');
    exit;
}

// Check if the username and password are correct
if ($username === $correct_username && $password === $correct_password) {
    // Authentication successful, set session variables
    $_SESSION['loggedin'] = true;
    $_SESSION['username'] = $username;
    
    // Redirect to the main page
    header('Location: index.php');
    exit;
} else {
    // Authentication failed, redirect back to login with error
    header('Location: login.php?error=invalid');
    exit;
}
?>
