<?php

// Si la petición es a un archivo estático que existe, deja que PHP lo sirva directamente
if (php_sapi_name() === 'cli-server') {
    $url  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $file = __DIR__ . $url;
    if ($url !== '/' && file_exists($file)) {
        return false;
    }
}

$isRailway = (bool)getenv('RAILWAY_PUBLIC_DOMAIN');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $isRailway,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// BASE: ruta base de la app. En local (XAMPP) es /Casino-Royale/public, en Railway es vacío.
define('BASE', $isRailway ? '' : '/Casino-Royale/public');

require __DIR__ . '/../routes/web.php';
