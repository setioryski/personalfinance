<?php
// config.php

// Require Composer's autoloader
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Determine the environment from an environment variable or default to 'development'
$env = getenv('APP_ENV') ?: 'development';

// Load the appropriate .env file based on the environment
if ($env === 'production') {
    $dotenv = Dotenv::createImmutable(__DIR__, '.env.production');
} else {
    $dotenv = Dotenv::createImmutable(__DIR__, '.env');
}

$dotenv->load();

// Set session cookie parameters based on environment variables
$cookie_lifetime = 30 * 24 * 60 * 60; // 30 days in seconds
session_set_cookie_params([
    'lifetime' => $cookie_lifetime,
    'path' => '/',
    'domain' => $_ENV['SESSION_COOKIE_DOMAIN'] ?? '',
    'secure' => filter_var($_ENV['SESSION_SECURE'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'httponly' => true,
    'samesite' => 'Lax'
]);

// Start the session
session_start();

// Regenerate session ID to prevent session fixation
if (!isset($_SESSION['initiated'])) {
    session_regenerate_id(true);
    $_SESSION['initiated'] = true;
}

// Optional: Implement session timeout and binding to IP/User-Agent as previously discussed
?>
