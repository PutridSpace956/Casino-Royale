<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resumen del producto</title>
    <link rel="stylesheet" href="styles/style.css">
</head>
<body>
<div class="page-wrapper">
    <div class="card">
        <h1>Producto registrado correctamente</h1>
        <p class="subtitle">Estos son los datos del producto guardado en la tienda.</p>

        <div class="product-summary">
            <div class="summary-block">
                <h2>
                    <?= htmlspecialchars($producto->getNombre()) ?>
                </h2>
                <ul>
                    <li>
                        <span class="summary-label">SKU:</span>
                        <?= htmlspecialchars($producto->getSku()) ?>
                    </li>
                    <li>
                        <span class="summary-label">Precio:</span>
                        <?= number_format($producto->getPrecio(), 2) ?> €
                    </li>
                    <li>
                        <span class="summary-label">Stock:</span>
                        <?= $producto->getStock() ?> u.
                    </li>
                    <li>
                        <span class="summary-label">Valor del stock:</span>
                        <strong><?= number_format($producto->getValorStock(), 2) ?> €</strong>
                    </li>
                </ul>

                <h3>Datos de la tienda</h3>
                <ul>
                    <li>
                        <span class="summary-label">Nombre:</span>
                        <?= htmlspecialchars($tienda->getNombre()) ?>
                    </li>
                    <li>
                        <span class="summary-label">Valor total del stock:</span>
                        <?= number_format($tienda->getValorTotalStock(), 2) ?> €
                    </li>
                </ul>
            </div>

            <div class="summary-block product-image">
                <?php if ($producto->getRutaImagen()): ?>
                    <img src="<?= htmlspecialchars($producto->getRutaImagen()) ?>" alt="Imagen del producto" style="max-width: 100%; border-radius: 8px;">
                <?php else: ?>
                    <p><em>Sin imagen disponible</em></p>
                <?php endif; ?>
            </div>
        </div>

        <div class="back-link">
            <a href="index.php">➜ Dar de alta otro producto</a>
        </div>
    </div>
</div>
</body>
</html>