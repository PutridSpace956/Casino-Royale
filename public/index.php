<?php

// Si la petición es a un archivo estático que existe, deja que PHP lo sirva directamente
if (php_sapi_name() === 'cli-server') {
    $url  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $file = __DIR__ . $url;
    if ($url !== '/' && file_exists($file)) {
        return false;
    }
}

session_start();

// BASE: ruta base de la app. En local (XAMPP) es /ns/public, en Railway es vacío.
define('BASE', getenv('RAILWAY_PUBLIC_DOMAIN') ? '' : '/Casino-Royale/public');

require __DIR__ . '/../routes/web.php';
