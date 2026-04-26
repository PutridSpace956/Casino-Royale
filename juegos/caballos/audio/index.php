<?php
require_once 'functions.php';
require_once 'classes/Producto.php';
require_once 'classes/Tienda.php';

$errores = [];
$datos = [
    'nombre' => '',
    'sku'    => '',
    'precio' => '',
    'stock'  => '',
    'email'  => '',
    'dni'    => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    foreach ($datos as $clave => $valor) {
        if (isset($_POST[$clave])) {
            $datos[$clave] = limpiarDato($_POST[$clave]);
        }
    }

    $imagen = $_FILES['imagen'] ?? null;

    $errores = validarFormulario($datos, $imagen);

    if (empty($errores)) {

        $rutaImagen = null;
        if ($imagen && $imagen['error'] !== UPLOAD_ERR_NO_FILE) {
            $rutaImagen = guardarImagen($imagen, 'subidas');
        }

        $producto = new Producto(
            $datos['nombre'],
            $datos['sku'],
            (float)$datos['precio'],
            (int)$datos['stock'],
            $rutaImagen
        );

        $tienda = new Tienda("Mi Tienda Online");

        $tienda->agregarProducto($producto);

        include 'views/resumen.php';
        exit;
    }
}

include 'views/formulario.php';
?>