<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['ok' => false, 'error' => 'Sesión no iniciada.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$fichas = isset($body['fichas']) ? intval($body['fichas']) : 0;
$precio = isset($body['precio']) ? floatval($body['precio']) : 0;

$paquetes = [
    500  => 4.99,
    1000 => 9.99,
    2500 => 19.99,
    5000 => 39.99,
];

if (!isset($paquetes[$fichas]) || abs($paquetes[$fichas] - $precio) > 0.01) {
    echo json_encode(['ok' => false, 'error' => 'Paquete no válido.']);
    exit;
}

require_once __DIR__ . '/../../app/models/Usuario.php';

function conectarBD_local() {
    $host   = 'localhost';
    $dbname = 'Merini_Federico_db';
    $user   = 'root';
    $pass   = '';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}

try {
    $db  = conectarBD_local();
    $usuario = new Usuario($db);
    $row = $usuario->obtenerSaldo($_SESSION['user_id']);
    $saldoActual = $row ? intval($row['saldo']) : 0;
    $nuevoSaldo  = $saldoActual + $fichas;
    $usuario->actualizarSaldo($_SESSION['user_id'], $nuevoSaldo);
    $_SESSION['user_saldo'] = $nuevoSaldo;
    echo json_encode(['ok' => true, 'saldo' => $nuevoSaldo]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'Error interno.']);
}
