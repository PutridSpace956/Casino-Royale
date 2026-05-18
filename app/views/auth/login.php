<!-- Vista: formulario de inicio de sesión.
     Los errores y mensajes de éxito vienen desde routes/web.php en $error y $success. -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Royal Casino</title>
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
            <p class="card-title">Iniciar Sesión</p>

            <?php if (!empty($error)): ?>
                <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <?php if (!empty($success)): ?>
                <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <form method="POST" action="?page=login">
                <label for="email">Correo electrónico</label>
                <input type="email" id="email" name="email" class="auth-input"
                       placeholder="tu@email.com" required
                       value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">

                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" class="auth-input"
                       placeholder="••••••••" required>

                <button type="submit" class="btn-auth">Entrar</button>
            </form>

            <div class="links">
                ¿No tienes cuenta? <a href="?page=register">Regístrate aquí</a>
            </div>
            <a href="<?= BASE ?>/" class="back">← Volver al inicio</a>
        </div>
    </div>
    <script src="<?= BASE ?>/assets/js/login.js"></script>
</body>
</html>
