<?php
// API: procesa una tirada de la tragaperras.
// Recibe la apuesta, genera 3 símbolos aleatorios, calcula si hay premio,
// actualiza el saldo y guarda la partida en la base de datos.

session_start();
header('Content-Type: application/json');

// Solo pueden jugar usuarios con sesión iniciada
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Debes iniciar sesión.']);
    exit;
}

// Leer la apuesta enviada desde el juego
$data    = json_decode(file_get_contents('php://input'), true);
$apuesta = intval($data['apuesta'] ?? 0);

// La apuesta debe estar entre 1 y 20 fichas
if ($apuesta < 1 || $apuesta > 20) {
    http_response_code(400);
    echo json_encode(['error' => 'La apuesta debe estar entre 1 y 20.']);
    exit;
}

require_once __DIR__ . '/../../app/core/Database.php';
require_once __DIR__ . '/../../app/models/Usuario.php';
require_once __DIR__ . '/../../app/models/Partida.php';

try {
    $db           = conectarBD();
    $usuarioModel = new Usuario($db);
    $partidaModel = new Partida($db);

    // Obtener el saldo actual del usuario desde la base de datos
    $saldoData = $usuarioModel->obtenerSaldo($_SESSION['user_id']);
    $saldo     = (int)$saldoData['saldo'];

    // Comprobar que el usuario tiene suficiente saldo
    if ($apuesta > $saldo) {
        http_response_code(400);
        echo json_encode(['error' => 'Saldo insuficiente.']);
        exit;
    }

    // Símbolos disponibles y sus multiplicadores de premio
    $simbolos        = ['🍒', '🍋', '🔔', '⭐', '🍀', '7️⃣'];
    $multiplicadores = [5, 10, 25, 50, 100, 500];

    // Generar 3 símbolos aleatorios (los rodillos)
    $resultado = [
        $simbolos[array_rand($simbolos)],
        $simbolos[array_rand($simbolos)],
        $simbolos[array_rand($simbolos)],
    ];

    // Calcular ganancia: solo hay premio si los 3 símbolos son iguales
    $ganancia = 0;
    if ($resultado[0] === $resultado[1] && $resultado[1] === $resultado[2]) {
        $idx      = array_search($resultado[0], $simbolos);
        $ganancia = $apuesta * $multiplicadores[$idx];
    }

    // Actualizar saldo: restar apuesta y sumar ganancia
    $nuevoSaldo = $saldo - $apuesta + $ganancia;
    $usuarioModel->actualizarSaldo($_SESSION['user_id'], $nuevoSaldo);
    $_SESSION['user_saldo'] = $nuevoSaldo;

    // Guardar el registro de la partida
    $partidaModel->guardar($_SESSION['user_id'], 'tragaperras', $apuesta, $ganancia);

    // Devolver el resultado al juego en formato JSON
    echo json_encode([
        'resultado' => $resultado,
        'ganancia'  => $ganancia,
        'saldo'     => $nuevoSaldo,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos.']);
}
