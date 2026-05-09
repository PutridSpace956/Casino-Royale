<?php
class GameController {

    public function blackjack() {
        require '../app/views/games/blackjack/index.php';
    }

    public function caballos() {
        require '../app/views/games/caballos/index.php';
    }

    public function ruleta() {
        require '../app/views/games/ruleta/index.php';
    }

    public function tragaperras() {
        require '../app/views/games/tragaperras/index.php';
    }
}
