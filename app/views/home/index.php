<?php
$isLoggedIn = isset($_SESSION['user_id']);
$userName   = htmlspecialchars($_SESSION['user_nombre'] ?? '');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Royal Casino</title>
    <link rel="stylesheet" href="<?= BASE ?>/assets/css/style.css">
    <link rel="icon" href="<?= BASE ?>/assets/img/jons_img1.png">

</head>
<body>
    <div class="section" id="hero">
        <header>
            <div class="titulo-escudos">
                <div class="Logo"><img src="<?= BASE ?>/assets/img/Escudo.png" alt="escudo"></div>
                <div class="Titulo"><h1>Royal Casino</h1></div>
                <?php if ($isLoggedIn): ?>
                    <div class="Logo user-info">
                        <img src="<?= BASE ?>/assets/img/usuario.png" alt="usuario" class="usuario">
                        <span class="user-name"><?= $userName ?></span>
                        <span class="user-fichas">🪙 <?= number_format((int)($_SESSION['user_saldo'] ?? 0)) ?> fichas</span>
                        <a href="?page=logout" class="logout-link">Salir</a>
                    </div>
                <?php else: ?>
                    <div class="Logo">
                        <a href="?page=login"><img src="<?= BASE ?>/assets/img/usuario.png" alt="usuario" class="usuario"></a>
                    </div>
                <?php endif; ?>
            </div>
            <div class="carrusel" style="overflow:hidden; position:relative; white-space:nowrap;">
                <span id="ticker" style="display:inline-block; position:relative;"></span>
            </div>
        </header>
    </div>

    <div class="section" id="main-content">
        <main>
            <section class="explicacion">
                <p>La experiencia definitiva de azar online.</p>
                <p>Gráficos envolventes, premios reales.</p>
            </section>
            <section class="juegos">
                <div class="juego tragaperras" onclick="location.href='?page=tragaperras'"
                     style="background-image:url('<?= BASE ?>/assets/img/Tragaperra.jpg')">
                    <h2>Tragaperras</h2>
                </div>
                <div class="juego blackjack" onclick="location.href='?page=blackjack'"
                     style="background-image:url('<?= BASE ?>/assets/img/Blackjack.jpg')">
                    <h2>Blackjack</h2>
                </div>
                <div class="juego ruleta" onclick="location.href='?page=ruleta'"
                     style="background-image:url('<?= BASE ?>/assets/img/ruleta.jpg')">
                    <h2>Ruleta</h2>
                </div>
                <div class="juego caballos" onclick="location.href='?page=caballos'"
                     style="background-image:url('<?= BASE ?>/assets/img/Caballos.jpg')">
                    <h2>Caballos</h2>
                </div>
            </section>
        </main>
    </div>

    <div class="section" id="footer">
        <footer>
            <div class="footer-content">
              <h1>Royal Casino</h1>
              <div class="carousel-wrapper">
                  <button class="prev">&#8249;</button>
                  <div class="carousel">
                    <div class="slide active">
                      <div class="content">
                        <h2>PROMOCIONES</h2>
                        <p>
                          Consigue más fichas <br>para seguir jugando
                        </p>
                        <button onclick="location.href='?page=<?= $isLoggedIn ? 'fichas' : 'login' ?>'">COMPRAR FICHAS</button>
                      </div>
                      <img src="<?= BASE ?>/assets/img/logo.png" alt="Promo 1">
                    </div>

                    <div class="slide">
                      <div class="content">
                        <h2>BONUS DE BIENVENIDA</h2>
                        <p>
                          Consigue tu bono de bienvenida y <br>empieza a jugar hoy mismo con increíbles recompensas.
                        </p>
                        <button onclick="<?= $isLoggedIn ? "document.getElementById('main-content').scrollIntoView({behavior:'smooth'})" : "location.href='?page=register'" ?>">CONSIGUE BONUS</button>
                      </div>
                      <img src="<?= BASE ?>/assets/img/jons_img1.png" alt="Promo 2">
                    </div>

                    <div class="slide">
                      <div class="content">
                        <h2>NUEVOS JUEGOS</h2>
                        <p>
                          Descubre los juegos más nuevos y <br>disfruta de la mejor experiencia de juego.
                        </p>
                        <button onclick="window.location.href='#main-content'">DESCUBRE</button>
                      </div>
                      <img src="<?= BASE ?>/assets/img/imag.jpg" alt="Promo 3">
                    </div>
                </div>
                <button class="next">&#8250;</button>
              </div>
              <div class="copy">
                <p>&copy; 2025 Todos los derechos reservados.</p>
                <p>Juega con responsabilidad.</p>
              </div>
            </div>
        </footer>
    </div>
    <script src="<?= BASE ?>/assets/js/script.js"></script>
</body>
</html>
