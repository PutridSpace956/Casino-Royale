CREATE DATABASE IF NOT EXISTS Merini_Federico_db;
USE Merini_Federico_db;

CREATE TABLE usuario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    username         VARCHAR(50) UNIQUE NOT NULL,
    email            VARCHAR(150) UNIQUE NOT NULL,
    dni              CHAR(9) UNIQUE NOT NULL,
    contrasena       VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    saldo            INT DEFAULT 1000,
    fecha_registro   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE partida (
    id_partida INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    juego      VARCHAR(50) NOT NULL,
    apuesta    INT NOT NULL,
    ganancia   INT NOT NULL,
    fecha      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE sesion (
    id_sesion    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario   INT NOT NULL,
    ip           VARCHAR(45) NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin    DATETIME,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);
