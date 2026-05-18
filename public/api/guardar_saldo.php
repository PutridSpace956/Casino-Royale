<?php
session_start();

if (!isset($_SESSION['user_id'])) exit;

$data  = json_decode(file_get_contents('php://input'), true);
$saldo = intval($data['saldo'] ?? -1);
if ($saldo < 0) exit;

require_once __DIR__ . '/../../app/core/Database.php';
require_once __DIR__ . '/../../app/models/Usuario.php';

try {
    $db = conectarBD();
    (new Usuario($db))->actualizarSaldo($_SESSION['user_id'], $saldo);
    $_SESSION['user_saldo'] = $saldo;
} catch (Exception $e) { /* fallo silencioso — no interrumpir al usuario */ }
