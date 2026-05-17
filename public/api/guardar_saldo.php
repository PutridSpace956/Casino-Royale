<?php
// API: actualiza el saldo del usuario cuando abandona una página de juego.
// Se llama automáticamente con sendBeacon() al cerrar o cambiar de página,
// para asegurarse de que el saldo quede guardado aunque el usuario salga sin terminar.

session_start();

// Solo actuar si el usuario tiene sesión iniciada y el saldo es válido
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
