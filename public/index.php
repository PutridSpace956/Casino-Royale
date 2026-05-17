<?php
// Punto de entrada principal de la aplicación.
// Todas las URLs pasan por este archivo (index.php).

session_start(); // iniciar la sesión para manejar usuarios logueados

// BASE es la URL base del proyecto (ej: /ns/public), necesaria para construir URLs correctas
define('BASE', rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/'));

// Cargar el enrutador, que decide qué página mostrar
require '../routes/web.php';
