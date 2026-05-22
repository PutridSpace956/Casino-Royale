<?php
session_start();

define('BASE', getenv('RAILWAY_ENVIRONMENT') ? '' : '/ns/public');

require __DIR__ . '/../routes/web.php';