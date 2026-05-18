<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprar Fichas - Royal Casino</title>
  <link rel="stylesheet" href="<?= BASE ?>/assets/css/fichas.css">
</head>
<body data-base="<?= BASE ?>">

  <header>
    <div class="Logo"><img src="<?= BASE ?>/assets/img/Escudo.png" alt="escudo"></div>
    <h1>Royal Casino</h1>
    <div class="Logo"><img src="<?= BASE ?>/assets/img/Escudo.png" alt="escudo"></div>
  </header>

  <div class="toolbar">
    <button id="volver" onclick="window.location.href='<?= BASE ?>/'">← Página principal</button>
  </div>

  <main class="fichas-main">
    <h2>Comprar Fichas</h2>
    <p class="subtitulo">Selecciona un paquete y rellena los datos de tu tarjeta</p>

    <div id="alerta" class="alerta oculto"></div>

    <div class="paquetes">
      <div class="paquete" data-fichas="500" data-precio="4.99">
        <span class="paquete-nombre">Bronce</span>
        <span class="paquete-fichas">500 fichas</span>
        <span class="paquete-precio">€4,99</span>
      </div>
      <div class="paquete" data-fichas="1000" data-precio="9.99">
        <span class="paquete-nombre">Plata</span>
        <span class="paquete-fichas">1.000 fichas</span>
        <span class="paquete-precio">€9,99</span>
      </div>
      <div class="paquete selected" data-fichas="2500" data-precio="19.99">
        <span class="paquete-nombre">Oro</span>
        <span class="paquete-fichas">2.500 fichas</span>
        <span class="paquete-precio">€19,99</span>
      </div>
      <div class="paquete" data-fichas="5000" data-precio="39.99">
        <span class="paquete-nombre">Platino</span>
        <span class="paquete-fichas">5.000 fichas</span>
        <span class="paquete-precio">€39,99</span>
      </div>
    </div>

    <form id="form-compra" autocomplete="off">
      <div class="campo">
        <label for="titular">Titular de la tarjeta</label>
        <input type="text" id="titular" placeholder="Nombre Apellido" maxlength="60">
      </div>

      <div class="campo">
        <label for="numero">Número de tarjeta</label>
        <input type="text" id="numero" placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric">
      </div>

      <div class="campo-fila">
        <div class="campo">
          <label for="caducidad">Caducidad</label>
          <input type="text" id="caducidad" placeholder="MM/AA" maxlength="5" inputmode="numeric">
        </div>
        <div class="campo">
          <label for="cvv">CVV</label>
          <input type="text" id="cvv" placeholder="123" maxlength="4" inputmode="numeric">
        </div>
      </div>

      <button type="submit" id="btn-comprar">Comprar fichas</button>
    </form>
  </main>

  <script src="<?= BASE ?>/assets/js/comprar_fichas.js"></script>
</body>
</html>
