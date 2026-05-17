<?php
// API: guarda el resultado de una partida (blackjack o ruleta) en la base de datos
// y actualiza el saldo del usuario.
// Se llama desde el JavaScript de los juegos al terminar una ronda.

session_start();
header('Content-Type: application/json');

// Solo pueden acceder usuarios que hayan iniciado sesión
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Leer los datos enviados desde el juego (en formato JSON)
$data     = json_decode(file_get_contents('php://input'), true);
$juego    = trim($data['juego']    ?? '');
$apuesta  = intval($data['apuesta']  ?? 0);
$ganancia = intval($data['ganancia'] ?? 0);
$saldo    = intval($data['saldo']    ?? -1);

// Validar que los datos sean correctos antes de guardar
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

    // Actualizar el saldo del usuario en la base de datos
    (new Usuario($db))->actualizarSaldo($_SESSION['user_id'], $saldo);

    // Actualizar la sesión inmediatamente, antes del registro de partida,
    // para que la siguiente página vea el saldo correcto aunque falle el INSERT
    $_SESSION['user_saldo'] = $saldo;

    // Guardar el registro de la partida
    (new Partida($db))->guardar($_SESSION['user_id'], $juego, $apuesta, $ganancia);

    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
}
