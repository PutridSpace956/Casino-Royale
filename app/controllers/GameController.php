<?php
class GameController {

    public function blackjack() {
        require __DIR__ . '/../views/games/blackjack/index.php';
    }

    public function ruleta() {
        require __DIR__ . '/../views/games/ruleta/index.php';
    }

    public function tragaperras() {
        require __DIR__ . '/../views/games/tragaperras/index.php';
    }

    public function caballos() {
        require __DIR__ . '/../views/games/caballos/index.php';
    }

    public function fichas() {
        require __DIR__ . '/../views/fichas/index.php';
    }
}
