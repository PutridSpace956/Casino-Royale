<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Royal Casino</title>
    <link rel="stylesheet" href="<?= BASE ?>/assets/css/style.css">
    <link rel="stylesheet" href="<?= BASE ?>/assets/css/auth.css">
    <link rel="icon" href="<?= BASE ?>/assets/img/jons_img1.png">
</head>
<body>
    <div class="auth-header">
        <img src="<?= BASE ?>/assets/img/Escudo.png" alt="escudo">
        <h1>Royal Casino</h1>
        <img src="<?= BASE ?>/assets/img/Escudo.png" alt="escudo">
    </div>

    <div class="auth-body">
        <div class="card">
            <p class="card-title">Crear Cuenta</p>
            <p class="bonus">¡Recibe 1.000 fichas de bienvenida al registrarte!</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <?php if (!empty($success)): ?>
                <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <form method="POST" action="?page=register">
                <label for="nombre">Nombre</label>
                <input type="text" id="nombre" name="nombre" class="auth-input"
                       placeholder="Ej: Juan Carlos" required
                       value="<?= htmlspecialchars($_POST['nombre'] ?? '') ?>">

                <label for="apellido">Primer apellido</label>
                <input type="text" id="apellido" name="apellido" class="auth-input"
                       placeholder="Ej: García" required
                       value="<?= htmlspecialchars($_POST['apellido'] ?? '') ?>">

                <label for="username">Nombre de usuario</label>
                <input type="text" id="username" name="username" class="auth-input"
                       placeholder="Ej: jugador_99" required maxlength="20"
                       value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">

                <label for="dni">DNI</label>
                <input type="text" id="dni" name="dni" class="auth-input"
                       placeholder="Ej: 12345678Z" required maxlength="9"
                       value="<?= htmlspecialchars($_POST['dni'] ?? '') ?>">

                <label for="email">Correo electrónico</label>
                <input type="email" id="email" name="email" class="auth-input"
                       placeholder="tu@email.com" required
                       value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">

                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" class="auth-input"
                       placeholder="Mínimo 6 caracteres" required>
                <p class="hint">Al menos 6 caracteres</p>

                <label for="fecha_nacimiento">Fecha de nacimiento</label>
                <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" class="auth-input"
                       required
                       max="<?= (date('Y') - 18) . date('-m-d') ?>"
                       value="<?= htmlspecialchars($_POST['fecha_nacimiento'] ?? '') ?>">

                <button type="submit" class="btn-auth">Crear cuenta</button>
            </form>

            <div class="links">
                ¿Ya tienes cuenta? <a href="?page=login">Inicia sesión aquí</a>
            </div>
            <a href="<?= BASE ?>/" class="back">← Volver al inicio</a>
        </div>
    </div>
    <script src="<?= BASE ?>/assets/js/register.js"></script>
</body>
</html>
