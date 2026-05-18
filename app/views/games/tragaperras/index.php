<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tragaperras - Royal Casino</title>
  <link rel="stylesheet" href="<?= BASE ?>/games/tragaperras/style.css">
</head>
<body>
  <header>
    <div class="Logo"><img src="<?= BASE ?>/games/tragaperras/img/Escudo.png" alt="escudo"></div>
    <h1>🎰 Tragaperras</h1>
    <div class="Logo"><img src="<?= BASE ?>/games/tragaperras/img/Escudo.png" alt="escudo"></div>
  </header>

  <div class="toolbar">
    <button id="toggle-music">🔊 Música</button>
    <button id="volver" onclick="window.location.href='<?= BASE ?>/'">← Página principal</button>
  </div>

  <div class="page-layout">
    <aside>
      <p class="aside-title">Premios</p>
      <ul>
        <li><span class="sim">🍒🍒🍒</span><span class="mul">✕5</span></li>
        <li><span class="sim">🍋🍋🍋</span><span class="mul">✕10</span></li>
        <li><span class="sim">🔔🔔🔔</span><span class="mul">✕25</span></li>
        <li><span class="sim">⭐⭐⭐</span><span class="mul">✕50</span></li>
        <li><span class="sim">🍀🍀🍀</span><span class="mul">✕100</span></li>
        <li><span class="sim">7️⃣7️⃣7️⃣</span><span class="mul">✕500</span></li>
      </ul>
      <div id="result-message" class="mensaje-premio"></div>
    </aside>

    <main class="slot">
      <audio id="bg-music" src="<?= BASE ?>/games/tragaperras/audio/musicafondo.mp3" loop></audio>

      <div class="fichas-box">
        <span class="fichas-label">FICHAS</span>
        <span id="saldo-display" class="fichas-valor"><?= (int)($_SESSION['user_saldo'] ?? 0) ?></span>
      </div>

      <section class="slot__reels">
        <div class="reel" id="reel-1"></div>
        <div class="reel" id="reel-2"></div>
        <div class="reel" id="reel-3"></div>

        <div class="lever-container">
          <div id="lever" class="lever">
            <div class="lever-ball"></div>
            <div class="lever-stick"></div>
          </div>
        </div>
      </section>

      <div id="apuesta-container">
        <span class="apuesta-label">APUESTA</span>
        <input type="number" id="apuesta-valor" min="1" max="20" value="1" />
      </div>
    </main>
  </div>

  <script>const BASE = '<?= BASE ?>';</script>
  <script src="<?= BASE ?>/games/tragaperras/script.js?v=3"></script>
</body>
</html>
