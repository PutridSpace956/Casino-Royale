<?php

function conectarBD() {
    $conexion = new PDO(
        "mysql:host=localhost;dbname=Merini_Federico_db;charset=utf8",
        "root",
        ""
    );

    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $conexion;
}
