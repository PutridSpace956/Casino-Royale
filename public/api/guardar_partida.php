<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$juego    = trim($data['juego']    ?? '');
$apuesta  = intval($data['apuesta']  ?? 0);
$ganancia = intval($data['ganancia'] ?? 0);
$saldo    = intval($data['saldo']    ?? -1);

if (!in_array($juego, ['blackjack', 'ruleta']) || $apuesta < 0 || $ganancia < 0 || $saldo < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

require_once __DIR__ . '/../../app/core/Database.php';
require_once __DIR__ . '/../../app/models/Usuario.php';
require_once __DIR__ . '/../../app/models/Partida.php';

try {
    $db = conectarBD();

    (new Usuario($db))->actualizarSaldo($_SESSION['user_id'], $saldo);
    $_SESSION['user_saldo'] = $saldo;
    (new Partida($db))->guardar($_SESSION['user_id'], $juego, $apuesta, $ganancia);

    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
}
