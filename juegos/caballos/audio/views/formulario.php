<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de stock - Alta de producto</title>
    <link rel="stylesheet" href="styles/style.css">
</head>
<body>
<div class="page-wrapper">
    <div class="card">
        <h1>Alta de producto en la tienda online</h1>
        <p class="subtitle">Rellena los datos del producto que quieras añadir al stock.</p>

        <?php if (!empty($errores)): ?>
            <div class="error-box">
                <p>Se han encontrado los siguientes errores:</p>
                <ul>
                    <?php foreach ($errores as $campo => $mensaje): ?>
                        <li><?= htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8') ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <form action="index.php" method="post" enctype="multipart/form-data">
            <div class="form-grid">
                <div class="field-group">
                    <label>Nombre del producto:</label>
                    <input type="text" name="nombre" value="<?php htmlspecialchars($datos['nombre'] ?? '') ?>">
                </div>

                <div class="field-group">
                    <label>Código SKU:</label>
                    <input type="text" name="sku" value="<?php htmlspecialchars($datos['sku'] ?? '') ?>">
                </div>

                <div class="field-group">
                    <label>Precio (€):</label>
                    <input type="text" name="precio" value="<?php htmlspecialchars($datos['precio'] ?? '') ?>">
                </div>

                <div class="field-group">
                    <label>Stock disponible:</label>
                    <input type="number" name="stock" value="<?php htmlspecialchars($datos['stock'] ?? '') ?>">
                </div>

                <div class="field-group">
                    <label>Email del proveedor:</label>
                    <input type="email" name="email" value="<?php htmlspecialchars($datos['email'] ?? '') ?>">
                </div>

                <div class="field-group">
                    <label>DNI del responsable de stock:</label>
                    <input type="text" name="dni" placeholder="12345678A" value="<?php htmlspecialchars($datos['dni'] ?? '') ?>">
                    <span class="helper-text">Formato: 8 cifras + 1 letra.</span>
                </div>

                <div class="field-group">
                    <label>Imagen del producto:</label>
                    <input type="file" name="imagen" accept="image/jpeg,image/png">
                    <span class="helper-text">JPEG o PNG, máximo 2 MB.</span>
                </div>
            </div>

            <button type="submit">Guardar producto</button>
        </form>
    </div>
</div>
</body>
</html>