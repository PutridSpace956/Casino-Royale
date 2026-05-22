<?php

function conectarBD() {
    // Lee las variables de entorno (Railway las inyecta automáticamente).
    // Si no existen (entorno local), usa los valores por defecto de XAMPP.
    $host = getenv('MYSQLHOST') ?: 'localhost';
    $port = getenv('MYSQLPORT') ?: '3306';
    $db   = getenv('MYSQLDATABASE') ?: 'Merini_Federico_db';
    $user = getenv('MYSQLUSER') ?: 'root';
    $pass = getenv('MYSQLPASSWORD') ?: '';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8";

    $conexion = new PDO($dsn, $user, $pass);

    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $conexion;
}