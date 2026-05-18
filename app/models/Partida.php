<?php

// Esta clase gestiona el historial de partidas en la base de datos.
// Cada vez que un usuario juega, se guarda un registro con el resultado.
class Partida {

    private $conn; // conexión a la base de datos

    public function __construct($db) {
        $this->conn = $db;
    }

    // Guarda el resultado de una partida en la tabla 'partida'.
    // $idUsuario: ID del jugador
    // $juego:     nombre del juego ('blackjack', 'ruleta', 'tragaperras')
    // $apuesta:   cantidad apostada
    // $ganancia:  cantidad ganada (0 si perdió)
    public function guardar($idUsuario, $juego, $apuesta, $ganancia) {
        $stmt = $this->conn->prepare(
            "INSERT INTO partida(id_usuario, juego, apuesta, ganancia)
             VALUES(:id_usuario, :juego, :apuesta, :ganancia)"
        );

        return $stmt->execute([
            ':id_usuario' => $idUsuario,
            ':juego'      => $juego,
            ':apuesta'    => $apuesta,
            ':ganancia'   => $ganancia
        ]);
    }
}
