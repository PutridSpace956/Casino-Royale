<?php

// Esta función crea y devuelve la conexión a la base de datos.
// Se usa en routes/web.php y en los archivos de la carpeta api/.
function conectarBD() {
    $conexion = new PDO(
        "mysql:host=localhost;dbname=Merini_Federico_db;charset=utf8",
        "root",   // usuario de MySQL (por defecto en XAMPP es root)
        ""        // contraseña de MySQL (por defecto en XAMPP está vacía)
    );

    // Configurar PDO para que lance errores automáticamente si algo falla
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $conexion;
}
