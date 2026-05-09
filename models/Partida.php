
<?php

class Partida {

    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function guardar($idUsuario,$juego,$apuesta,$ganancia) {

        $stmt = $this->conn->prepare(
            "INSERT INTO partida(id_usuario,juego,apuesta,ganancia)
             VALUES(:id_usuario,:juego,:apuesta,:ganancia)"
        );

        return $stmt->execute([
            ':id_usuario'=>$idUsuario,
            ':juego'=>$juego,
            ':apuesta'=>$apuesta,
            ':ganancia'=>$ganancia
        ]);
    }
}
