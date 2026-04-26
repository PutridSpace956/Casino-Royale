<?php
function limpiarDato(string $dato): string {
    return htmlspecialchars(trim($dato), ENT_QUOTES, 'UTF-8');
}

function validarFormulario(array $datos, ?array $imagen): array {
    $errores = [];
    if (empty($datos['nombre'])) {
        $errores['nombre'] = 'El nombre  es obligatorio';
    } elseif(strlen($datos['nombre']) < 3){
        $errores['$nombre'] = 'Debe tener al menos 3 caracteres'
    }

    if (empty($datos['sku'])) {
        $errores['sku'] = 'El SKU es obligatorio.';
    } elseif (!preg_match('/^[A-Za-z0-9]{5,10}$/', $datos['sku'])) {
        $errores['sku'] = 'El SKU debe tener entre 5 y 10 caracteres alfanuméricos';
    }

    if (empty($datos['precio']) || !is_numeric($datos['precio']) || $datos['precio'] <= 0) {
        $errores['precio'] = 'El precio debe ser un número mayor que 0';
    }

    if ($datos['stock'] === '' || filter_var($datos['stock'], FILTER_VALIDATE_INT) === false || $datos['stock'] < 0) {
        $errores['stock'] = 'El stock debe ser un número entero mayor o igual a 0';
    }

    if (empty($datos['email']) || !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
        $errores['email'] = 'El email no es válido';
    }

    $patronDni = '/^[0-9]{8}[A-Za-z]$/';
    if (empty($datos['dni']) || !preg_match($patronDni, $datos['dni'])) {
        $errores['dni'] = 'El DNI debe tener 8 dígitos y una letra (ej: 12345678A)';
    }

    if (isset($imagen) && $imagen['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($imagen['error'] !== UPLOAD_ERR_OK) {
            $errores['imagen'] = 'Error al subir la imagen (código ' . $imagen['error'] . ')';
        } else {
            $tiposPermitidos = ['image/jpeg', 'image/png'];
            if (!in_array($imagen['type'], $tiposPermitidos)) {
                $errores['imagen'] = 'El formato de imagen debe ser JPEG o PNG';
            } elseif ($imagen['size'] > 2 * 1024 * 1024) {
                $errores['imagen'] = 'La imagen no debe superar los 2 MB';
            }
        }
    }

    return $errores;
}

function guardarImagen(array $imagen, string $directorio): ?string{
    if ($imagen['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    if (!is_dir($directorio)) {
        mkdir($directorio, 0777, true);
    }
    $nombreLimpio = preg_replace('/[^A-Za-z0-9\._-]/', '', basename($imagen['name']));
    $nombreArchivo = time() . '_' . $nombreLimpio;
    
    $rutaDestino = $directorio . '/' . $nombreArchivo;

    if (move_uploaded_file($imagen['tmp_name'], $rutaDestino)) {
        return $rutaDestino;
    }

    return null;
}
?>