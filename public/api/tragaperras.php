<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Debes iniciar sesión.']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$apuesta = intval($data['apuesta'] ?? 0);

if ($apuesta < 1 || $apuesta > 20) {
    http_response_code(400);
    echo json_encode(['error' => 'La apuesta debe estar entre 1 y 20.']);
    exit;
}

require_once __DIR__ . '/../../app/core/Database.php';
require_once __DIR__ . '/../../app/models/Usuario.php';
require_once __DIR__ . '/../../app/models/Partida.php';

try {
    $db = conectarBD();
    $usuarioModel = new Usuario($db);
    $partidaModel = new Partida($db);

    $saldoData = $usuarioModel->obtenerSaldo($_SESSION['user_id']);
    $saldo     = (int)$saldoData['saldo'];

    if ($apuesta > $saldo) {
        http_response_code(400);
        echo json_encode(['error' => 'Saldo insuficiente.']);
        exit;
    }

    $simbolos        = ['🍒', '🍋', '🔔', '⭐', '🍀', '7️⃣'];
    $multiplicadores = [5, 10, 25, 50, 100, 500];

    $resultado = [
        $simbolos[array_rand($simbolos)],
        $simbolos[array_rand($simbolos)],
        $simbolos[array_rand($simbolos)],
    ];

    // premio solo si los 3 simbolos son iguales
    $ganancia = 0;
    if ($resultado[0] === $resultado[1] && $resultado[1] === $resultado[2]) {
        $idx      = array_search($resultado[0], $simbolos);
        $ganancia = $apuesta * $multiplicadores[$idx];
    }

    $nuevoSaldo = $saldo - $apuesta + $ganancia;
    $usuarioModel->actualizarSaldo($_SESSION['user_id'], $nuevoSaldo);
    $_SESSION['user_saldo'] = $nuevoSaldo;

    $partidaModel->guardar($_SESSION['user_id'], 'tragaperras', $apuesta, $ganancia);

    echo json_encode([
        'resultado' => $resultado,
        'ganancia'  => $ganancia,
        'saldo'     => $nuevoSaldo,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos.']);
}
