<?php
session_start();

define('BASE', getenv('RAILWAY_PUBLIC_DOMAIN') ? '' : '/ns/public');

require __DIR__ . '/../routes/web.php';
