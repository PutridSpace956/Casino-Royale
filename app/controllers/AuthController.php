<?php
class AuthController {

    public function login() {
        require __DIR__ . '/../views/auth/login.php';
    }

    public function register() {
        require __DIR__ . '/../views/auth/register.php';
    }
}
