<?php
// login.php
require_once 'config.php'; // Include centralized configuration

// Check if user is already logged in
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('Location: index.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta Tags and Title -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Finance Tracker</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS for macOS Styling -->
    <style>
        /* Apply macOS-like system font */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f5f5f5;
        }
        
        /* Center the login form */
        .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        
        /* Style the login card */
        .login-card {
            background-color: #ffffff;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        
        /* Style the login title */
        .login-title {
            text-align: center;
            margin-bottom: 1.5rem;
            color: #333333;
        }
        
        /* Style form labels */
        .form-label {
            color: #555555;
            font-weight: 500;
        }
        
        /* Style input fields */
        .form-control {
            border-radius: 8px;
            border: 1px solid #dcdcdc;
            padding: 0.75rem 1rem;
            transition: border-color 0.3s;
        }
        
        .form-control:focus {
            border-color: #5a67d8;
            box-shadow: 0 0 0 0.2rem rgba(90, 103, 216, 0.25);
        }
        
        /* Style the login button */
        .btn-login {
            width: 100%;
            padding: 0.75rem;
            border-radius: 8px;
            background-color: #5a67d8;
            border: none;
            color: #ffffff;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        
        .btn-login:hover {
            background-color: #434190;
        }
        
        /* Style error message */
        .error-message {
            color: #e53e3e;
            text-align: center;
            margin-top: 1rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 576px) {
            .login-card {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
        <h3 class="login-title">
            <i class="fas fa-wallet me-2"></i>LOGIN
        </h3>
            <form action="authenticate.php" method="post">
                <div class="mb-4">
                    <label for="username" class="form-label">Username<span class="text-danger">*</span></label>
                    <input type="text" id="username" name="username" class="form-control" required placeholder="Enter your username">
                </div>
                <div class="mb-4">
                    <label for="password" class="form-label">Password<span class="text-danger">*</span></label>
                    <input type="password" id="password" name="password" class="form-control" required placeholder="Enter your password">
                </div>
                <button type="submit" class="btn btn-login">Login</button>
            </form>
            <?php
            if (isset($_GET['error']) && $_GET['error'] == 'invalid') {
                echo "<p class='error-message'>Invalid username or password</p>";
            }
            ?>
        </div>
    </div>

    <!-- Font Awesome CDN for Icons -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" integrity="sha512-p6X3Y1MnwHvtLwZ0tpbXLEhD7f0SW4JzRlwY0GJwOKsMxLodFZ1e7U/OvzYkXK6tY9Xg1XmC/oaS+M3Gx0YyTA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    
    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
