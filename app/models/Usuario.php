<?php

// Esta clase gestiona todo lo relacionado con los usuarios en la base de datos.
// Se crea pasándole la conexión a la BD: new Usuario($db)
class Usuario {

    private $conn; // conexión a la base de datos

    public function __construct($db) {
        $this->conn = $db;
    }

    // Guarda un nuevo usuario en la base de datos.
    // La contraseña se guarda cifrada (nunca en texto plano).
    public function registrar($nombre, $username, $email, $dni, $password, $fechaNacimiento) {
        $sql = "INSERT INTO usuario(nombre, username, email, dni, contrasena, fecha_nacimiento)
                VALUES(:nombre, :username, :email, :dni, :contrasena, :fecha_nacimiento)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':nombre'           => $nombre,
            ':username'         => $username,
            ':email'            => $email,
            ':dni'              => strtoupper($dni),
            ':contrasena'       => password_hash($password, PASSWORD_BCRYPT), // cifrar contraseña
            ':fecha_nacimiento' => $fechaNacimiento
        ]);
    }

    // Busca un usuario por email y comprueba que la contraseña sea correcta.
    // Devuelve los datos del usuario si todo es correcto, o false si no existe.
    public function login($email, $password) {
        $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['contrasena'])) {
            return $user; // login correcto
        }

        return false; // email o contraseña incorrectos
    }

    // Actualiza el saldo de un usuario en la base de datos.
    public function actualizarSaldo($id, $saldo) {
        $stmt = $this->conn->prepare("UPDATE usuario SET saldo = :saldo WHERE id = :id");
        return $stmt->execute([':saldo' => $saldo, ':id' => $id]);
    }

    // Obtiene el saldo actual de un usuario.
    public function obtenerSaldo($id) {
        $stmt = $this->conn->prepare("SELECT saldo FROM usuario WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
