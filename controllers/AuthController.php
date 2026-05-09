<?php
class AuthController {

    public function login() {
        require '../app/views/auth/login.php';
    }

    public function register() {
        require '../app/views/auth/register.php';
    }
}
