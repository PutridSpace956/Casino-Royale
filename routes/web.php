<?php

// ============================================================
// ARCHIVOS NECESARIOS
// ============================================================
require_once '../app/core/Database.php';
require_once '../app/models/Usuario.php';
require_once '../app/models/Partida.php';


// ============================================================
// FUNCIONES DE AYUDA
// ============================================================

// Comprueba si un DNI español es válido.
// Un DNI válido tiene 8 números seguidos de una letra concreta.
// La letra se calcula dividiendo el número entre 23 y usando el resto.
function dniEsValido($dni) {
    $letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    if (!preg_match('/^\d{8}[A-Z]$/', $dni)) return false;
    return $dni[8] === $letras[(int)substr($dni, 0, 8) % 23];
}

// Cuenta cuántas palabras tiene un texto (separadas por espacios).
function contarPalabras($texto) {
    return count(preg_split('/\s+/', trim($texto), -1, PREG_SPLIT_NO_EMPTY));
}


// ============================================================
// VARIABLES INICIALES
// ============================================================
$error   = '';
$success = '';
$page    = $_GET['page'] ?? 'home'; // página actual según la URL


// ============================================================
// CERRAR SESIÓN
// ============================================================
if ($page === 'logout') {
    session_destroy();
    header('Location: ' . BASE . '/');
    exit;
}


// ============================================================
// PROCESAR FORMULARIOS (LOGIN Y REGISTRO)
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && in_array($page, ['login', 'register'])) {
    try {
        $db           = conectarBD();
        $usuarioModel = new Usuario($db);

        // --- LOGIN ---
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
                    // Guardar datos del usuario en la sesión
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

        // --- REGISTRO ---
        if ($page === 'register') {
            // Recoger y limpiar los datos del formulario
            $nombre           = implode(' ', preg_split('/\s+/', trim($_POST['nombre'] ?? ''), -1, PREG_SPLIT_NO_EMPTY));
            $apellido         = trim($_POST['apellido']         ?? '');
            $username         = trim($_POST['username']         ?? '');
            $dni              = strtoupper(trim($_POST['dni']   ?? ''));
            $email            = trim($_POST['email']            ?? '');
            $password         =           $_POST['password']    ?? '';
            $fecha_nacimiento =           $_POST['fecha_nacimiento'] ?? '';

            // Validar cada campo uno a uno
            if (empty($nombre) || empty($apellido) || empty($username) || empty($dni) || empty($email) || empty($password) || empty($fecha_nacimiento)) {
                $error = 'Por favor completa todos los campos.';
            } elseif (contarPalabras($nombre) > 2) {
                $error = 'El nombre puede tener máximo 2 palabras.';
            } elseif (strlen($nombre) < 2) {
                $error = 'El nombre debe tener al menos 2 caracteres.';
            } elseif (strlen($apellido) < 2) {
                $error = 'El apellido debe tener al menos 2 caracteres.';
            } elseif (strlen($username) < 3 || strlen($username) > 15) {
                $error = 'El nombre de usuario debe tener entre 3 y 15 caracteres.';
            } elseif (trim($username) === '') {
                $error = 'El nombre de usuario no puede ser solo espacios.';
            } elseif (!dniEsValido($dni)) {
                $error = 'El DNI no es válido (formato: 8 dígitos + letra correcta).';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'El email no es válido.';
            } elseif (strlen($password) < 6) {
                $error = 'La contraseña debe tener al menos 6 caracteres.';
            } elseif (strtotime($fecha_nacimiento) > strtotime('-18 years')) {
                $error = 'Debes tener al menos 18 años para registrarte.';
            } else {
                // Todo válido: intentar guardar en la base de datos
                try {
                    $usuarioModel->registrar($nombre . ' ' . $apellido, $username, $email, $dni, $password, $fecha_nacimiento);
                    $success = 'Registro exitoso. Ya puedes iniciar sesión.';
                    $page    = 'login';
                } catch (PDOException $e) {
                    // Detectar qué campo está duplicado según el mensaje de error
                    if ($e->getCode() == 23000) {
                        $msg = $e->getMessage();
                        if (stripos($msg, 'dni') !== false) {
                            $error = 'El DNI ya está registrado.';
                        } elseif (stripos($msg, 'username') !== false) {
                            $error = 'El nombre de usuario ya está en uso.';
                        } else {
                            $error = 'El email ya está registrado.';
                        }
                    } elseif (stripos($e->getMessage(), "Unknown column 'dni'") !== false) {
                        $error = 'Error de base de datos: falta la columna DNI. Importa el SQL actualizado.';
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


// ============================================================
// PROTEGER PÁGINAS DE JUEGOS (requieren sesión iniciada)
// ============================================================
$paginasProtegidas = ['blackjack', 'ruleta', 'tragaperras', 'caballos', 'fichas'];
if (in_array($page, $paginasProtegidas) && !isset($_SESSION['user_id'])) {
    $error = 'Debes iniciar sesión para acceder a los juegos.';
    $page  = 'login';
}

// Refrescar el saldo desde la BD al entrar a un juego para que data-fichas sea siempre exacto
if (in_array($page, $paginasProtegidas) && isset($_SESSION['user_id'])) {
    $db  = conectarBD();
    $row = (new Usuario($db))->obtenerSaldo($_SESSION['user_id']);
    if ($row) $_SESSION['user_saldo'] = (int)$row['saldo'];
}


// ============================================================
// MOSTRAR LA PÁGINA CORRECTA SEGÚN LA URL
// ============================================================
switch ($page) {
    case 'login':       require '../app/views/auth/login.php';              break;
    case 'register':    require '../app/views/auth/register.php';           break;
    case 'blackjack':   require '../app/views/games/blackjack/index.php';   break;
    case 'caballos':    require '../app/views/games/caballos/index.php';    break;
    case 'ruleta':      require '../app/views/games/ruleta/index.php';      break;
    case 'tragaperras': require '../app/views/games/tragaperras/index.php'; break;
    case 'fichas':      require '../app/views/fichas/index.php';           break;
    default:            require '../app/views/home/index.php';
}
