<?php
session_start();

// Unset all session variables and destroy the session
$_SESSION = array();
session_destroy();

// Redirect to login page
header('Location: login.php');
exit;
?>
