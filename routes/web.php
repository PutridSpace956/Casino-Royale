<?php

require_once '../app/core/Database.php';
require_once '../app/models/Usuario.php';
require_once '../app/models/Partida.php';

// valida que el DNI tenga 8 numeros y la letra correcta (calculo mod 23)
function dniEsValido($dni) {
    $letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    if (!preg_match('/^\d{8}[A-Z]$/', $dni)) return false;
    return $dni[8] === $letras[(int)substr($dni, 0, 8) % 23];
}

function contarPalabras($texto) {
    return count(array_filter(explode(' ', trim($texto))));
}

function calcularEdad($fecha) {
    $anio = (int)substr($fecha, 0, 4);
    $mes  = (int)substr($fecha, 5, 2);
    $dia  = (int)substr($fecha, 8, 2);
    $edad = (int)date('Y') - $anio;
    $diff = (int)date('m') - $mes;
    if ($diff < 0 || ($diff === 0 && (int)date('d') < $dia)) $edad--;
    return $edad;
}

$error   = '';
$success = '';
$page    = $_GET['page'] ?? 'home';

if ($page === 'logout') {
    session_destroy();
    header('Location: ' . BASE . '/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($page, ['login', 'register'])) {
    try {
        $db           = conectarBD();
        $usuarioModel = new Usuario($db);

        if ($page === 'login') {
            $email    = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            if (empty($email) || empty($password)) {
                $error = 'Por favor completa todos los campos.';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'El email no es válido.';
            } else {
                $user = $usuarioModel->login($email, $password);
                if ($user) {
                    $_SESSION['user_id']     = $user['id'];
                    $_SESSION['user_nombre'] = $user['username'];
                    $_SESSION['user_saldo']  = $user['saldo'];
                    header('Location: ' . BASE . '/');
                    exit;
                } else {
                    $error = 'Email o contraseña incorrectos.';
                }
            }
        }

        if ($page === 'register') {
            $nombre           = trim($_POST['nombre'] ?? '');
            $apellido         = trim($_POST['apellido']         ?? '');
            $username         = trim($_POST['username']         ?? '');
            $dni              = strtoupper(trim($_POST['dni']   ?? ''));
            $email            = trim($_POST['email']            ?? '');
            $password         =           $_POST['password']    ?? '';
            $fecha_nacimiento =           $_POST['fecha_nacimiento'] ?? '';

            if (empty($nombre) || empty($apellido) || empty($username) || empty($dni) || empty($email) || empty($password) || empty($fecha_nacimiento)) {
                $error = 'Por favor completa todos los campos.';
            } elseif (contarPalabras($nombre) > 2) {
                $error = 'El nombre puede tener máximo 2 palabras.';
            } elseif (strlen($nombre) < 2) {
                $error = 'El nombre debe tener al menos 2 caracteres.';
            } elseif (strlen($apellido) < 2) {
                $error = 'El apellido debe tener al menos 2 caracteres.';
            } elseif (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
                $error = 'El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números y guión bajo).';
            } elseif (!dniEsValido($dni)) {
                $error = 'El DNI no es válido (formato: 8 dígitos + letra correcta).';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'El email no es válido.';
            } elseif (strlen($password) < 6) {
                $error = 'La contraseña debe tener al menos 6 caracteres.';
            } elseif (calcularEdad($fecha_nacimiento) < 18) {
                $error = 'Debes tener al menos 18 años para registrarte.';
            } else {
                try {
                    $usuarioModel->registrar($nombre . ' ' . $apellido, $username, $email, $dni, $password, $fecha_nacimiento);
                    $success = 'Registro exitoso. Ya puedes iniciar sesión.';
                    $page    = 'login';
                } catch (PDOException $e) {
                    // codigo 23000 = campo duplicado (email, username o dni)
                    if ($e->getCode() == 23000) {
                        $msg = $e->getMessage();
                        if (stripos($msg, 'dni') !== false) {
                            $error = 'El DNI ya está registrado.';
                        } elseif (stripos($msg, 'username') !== false) {
                            $error = 'El nombre de usuario ya está en uso.';
                        } else {
                            $error = 'El email ya está registrado.';
                        }
                    } else {
                        $error = 'Error al registrar: ' . $e->getMessage();
                    }
                }
            }
        }

    } catch (PDOException $e) {
        $error = 'Error de conexión con la base de datos.';
    }
}

// redirigir al login si intenta acceder a un juego sin sesion
$paginasProtegidas = ['blackjack', 'ruleta', 'tragaperras', 'caballos', 'fichas'];
if (in_array($page, $paginasProtegidas) && !isset($_SESSION['user_id'])) {
    $error = 'Debes iniciar sesión para acceder a los juegos.';
    $page  = 'login';
}

// actualizar saldo desde BD antes de entrar al juego
if (in_array($page, $paginasProtegidas) && isset($_SESSION['user_id'])) {
    $db          = conectarBD();
    $usuarioTemp = new Usuario($db);
    $row         = $usuarioTemp->obtenerSaldo($_SESSION['user_id']);
    if ($row) $_SESSION['user_saldo'] = (int)$row['saldo'];
}

switch ($page) {
    case 'login':       require '../app/views/auth/login.php';              break;
    case 'register':    require '../app/views/auth/register.php';           break;
    case 'blackjack':   require '../app/views/games/blackjack/index.php';   break;
    case 'caballos':    require '../app/views/games/caballos/index.php';    break;
    case 'ruleta':      require '../app/views/games/ruleta/index.php';      break;
    case 'tragaperras': require '../app/views/games/tragaperras/index.php'; break;
    case 'fichas':      require '../app/views/fichas/index.php';            break;
    default:            require '../app/views/home/index.php';
}
