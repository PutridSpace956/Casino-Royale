<?php
session_start();

define('BASE', rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/'));

require '../routes/web.php';
