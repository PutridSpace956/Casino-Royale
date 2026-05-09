
<?php

class Usuario {

    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function registrar($nombre, $email, $password, $fechaNacimiento) {

        $sql = "INSERT INTO usuario(nombre,email,contrasena,fecha_nacimiento)
                VALUES(:nombre,:email,:contrasena,:fecha_nacimiento)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':contrasena' => password_hash($password, PASSWORD_BCRYPT),
            ':fecha_nacimiento' => $fechaNacimiento
        ]);
    }

    public function login($email,$password) {

        $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE email=:email");

        $stmt->execute([':email'=>$email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user && password_verify($password,$user['contrasena'])) {
            return $user;
        }

        return false;
    }

    public function actualizarSaldo($id,$saldo) {

        $stmt = $this->conn->prepare(
            "UPDATE usuario SET saldo=:saldo WHERE id=:id"
        );

        return $stmt->execute([
            ':saldo'=>$saldo,
            ':id'=>$id
        ]);
    }

    public function obtenerSaldo($id) {

        $stmt = $this->conn->prepare(
            "SELECT saldo FROM usuario WHERE id=:id"
        );

        $stmt->execute([':id'=>$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
