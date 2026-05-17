// ============================================================
// BLACKJACK - Lógica del juego
// El objetivo es sumar más que el dealer sin pasarse de 21.
// Las figuras (J, Q, K) valen 10. El As vale 11 o 1.
// ============================================================

const BASE = document.body.dataset.base || ''; // URL base del proyecto
localStorage.setItem('fichas', document.body.dataset.fichas || 1000); // inicializar fichas desde PHP

// --- Variables globales del juego ---
let deck        = [];   // baraja actual
let dealerCards = [];   // cartas del dealer
let playerCards = [];   // cartas del jugador
let hiddenCard  = null; // carta boca abajo del dealer
let canHit      = false; // si el jugador puede pedir carta

let chips      = getFichas(); // fichas actuales del jugador
let currentBet = 0;           // apuesta de la ronda actual

// Para guardar el resultado correcto en la base de datos
let saldoAntesDeBet = 0;
let apuestaDeBD     = 0;


// Envía el resultado de la partida al servidor para guardarlo en la base de datos
function guardarPartidaBJ(ganancia) {
    fetch(BASE + '/api/guardar_partida.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juego: 'blackjack', apuesta: apuestaDeBD, ganancia, saldo: chips })
    }).catch(() => {}); // ignorar errores de red silenciosamente
}

// Lee las fichas guardadas en localStorage
function getFichas() {
    let fichas = parseInt(localStorage.getItem("fichas"));
    if (isNaN(fichas)) {
        fichas = 50;
        localStorage.setItem("fichas", fichas);
    }
    return fichas;
}

// Guarda las fichas en localStorage
function setFichas(valor) {
    localStorage.setItem("fichas", valor);
}

// Inicialización: asignar eventos a los botones al cargar la página
window.onload = function() {
    document.getElementById("Apostar").addEventListener("click", apostar);
    document.getElementById("Pedir").addEventListener("click", pedir);
    document.getElementById("Quedarse").addEventListener("click", quedarse);
    document.getElementById("Doblar").addEventListener("click", doblar);
    document.getElementById("Separar").addEventListener("click", separar);
    document.getElementById("toggle-music").addEventListener("click", toggleMusic);

    buildDeck();
    shuffleDeck();
    updateChips();

    // Iniciar música al primer clic del usuario (los navegadores lo requieren)
    const music = document.getElementById("bg-music");
    document.body.addEventListener("click", () => {
        music.volume = 0.3;
        music.play().catch(() => {});
    }, { once: true });
};

// Crea una baraja completa de 52 cartas
function buildDeck() {
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits  = ["C","D","H","S"]; // C=clubs, D=diamonds, H=hearts, S=spades
    deck = [];
    for (let s of suits)
        for (let v of values)
            deck.push(`${v}-${s}`);
}

// Mezcla la baraja usando el algoritmo Fisher-Yates
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// El jugador realiza su apuesta y comienza la ronda
function apostar() {
    const betValue = parseInt(document.getElementById("bet-amount").value);
    if (isNaN(betValue) || betValue <= 0 || betValue > chips) {
        document.getElementById("Resultado").innerText = "⚠️ Apuesta inválida o insuficiente.";
        return;
    }

    saldoAntesDeBet = chips;
    apuestaDeBD     = betValue;
    currentBet      = betValue;
    chips          -= currentBet;
    setFichas(chips);
    updateChips();

    if (chips <= 0) checkGameOver();

    // Activar botones de juego y desactivar el de apostar
    document.getElementById("Apostar").disabled  = true;
    document.getElementById("Pedir").disabled    = false;
    document.getElementById("Quedarse").disabled = false;
    document.getElementById("Doblar").disabled   = false;
    document.getElementById("Separar").disabled  = false;

    buildDeck();
    shuffleDeck();
    startGame();
}

// Limpia la interfaz de manos separadas (split)
function resetSplitUI() {
    document.getElementById("split-hands").style.display = "none";
    document.getElementById("hand1").style.display       = "none";
    document.getElementById("hand2").style.display       = "none";
    document.getElementById("player-cards1").innerHTML   = "";
    document.getElementById("player-cards2").innerHTML   = "";
    document.getElementById("player-sum1").innerText     = "0";
    document.getElementById("player-sum2").innerText     = "0";
}

// Reparte las cartas iniciales: 1 oculta + 1 visible al dealer, 2 al jugador
async function startGame() {
    resetSplitUI();
    dealerCards    = [];
    playerCards    = [];
    playerCardsSep1 = [];
    playerCardsSep2 = [];
    activeHand     = 0;
    hiddenCard     = null;
    canHit         = true;

    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("Resultado").innerText    = "";
    document.getElementById("dealer-sum").innerText   = "?";
    document.getElementById("player-sum").innerText   = "";

    // Carta oculta del dealer (boca abajo)
    hiddenCard = deck.pop();
    dealerCards.push(hiddenCard);
    addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/back.png");

    await delay(600);
    const dealerVisible = deck.pop();
    dealerCards.push(dealerVisible);
    addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/" + formatCardName(dealerVisible) + ".png");

    // Dos cartas para el jugador
    await delay(600);
    for (let i = 0; i < 2; i++) {
        const c = deck.pop();
        playerCards.push(c);
        addCardAnimated("player-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
        await delay(600);
    }

    const playerVal = computeHandValue(playerCards);
    document.getElementById("player-sum").innerText = playerVal;

    // Comprobar Blackjack del dealer al inicio
    const dealerVal = computeHandValue(dealerCards);
    if (dealerVal === 21) {
        canHit = false;
        const hiddenImg = document.querySelector("#dealer-cards img:first-child");
        if (hiddenImg && hiddenCard)
            hiddenImg.src = BASE + "/games/blackjack/cartas/" + formatCardName(hiddenCard) + ".png";
        document.getElementById("dealer-sum").innerText = dealerVal;
        document.getElementById("Resultado").innerText  = "Dealer tiene Blackjack. Pierdes automáticamente.";
        document.getElementById("Apostar").disabled     = false;
        guardarPartidaBJ(0);
        return;
    }

    // Comprobar Blackjack del jugador al inicio
    if (playerVal === 21) {
        canHit = false;
        document.getElementById("Resultado").innerText = "¡Blackjack!";
        chips += currentBet * 2;
        setFichas(chips);
        updateChips();
        document.getElementById("Apostar").disabled = false;
        guardarPartidaBJ(apuestaDeBD * 2);
        return;
    }

    if (playerVal === 21 && playerVal === dealerVal) {
        canHit = false;
        document.getElementById("Resultado").innerText = "Ambos teneis blackjack, Empate";
        document.getElementById("Apostar").disabled    = false;
        guardarPartidaBJ(0);
        return;
    }
}

// El jugador pide una carta más
function pedir() {
    if (!canHit) return;

    const c = deck.pop();
    playerCards.push(c);
    addCardAnimated(
        activeHand === 1 ? "player-cards1" : activeHand === 2 ? "player-cards2" : "player-cards",
        BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png"
    );

    const playerVal = computeHandValue(playerCards);
    if (activeHand === 1)      document.getElementById("player-sum1").innerText = playerVal;
    else if (activeHand === 2) document.getElementById("player-sum2").innerText = playerVal;
    else                       document.getElementById("player-sum").innerText  = playerVal;

    // Si se pasa de 21, terminar automáticamente
    if (playerVal > 21) {
        canHit = false;
        setTimeout(() => {
            if (activeHand === 1 || activeHand === 2) cambiarMano();
            else revealDealerOnly();
        }, 800);
    }
}

// El jugador se planta con las cartas actuales
function quedarse() {
    if (!canHit) return;
    canHit = false;
    if (activeHand === 1 || activeHand === 2) cambiarMano();
    else revealDealerAndPlay();
}

// Revela la carta oculta del dealer y juega su turno automáticamente
async function revealDealerAndPlay() {
    const hiddenImg = document.querySelector("#dealer-cards img:first-child");
    if (hiddenImg && hiddenCard)
        hiddenImg.src = BASE + "/games/blackjack/cartas/" + formatCardName(hiddenCard) + ".png";

    await delay(600);

    let dealerVal = computeHandValue(dealerCards);
    document.getElementById("dealer-sum").innerText = dealerVal;

    // El jugador con mano dividida: usar la mejor de las dos
    let playerVal;
    if (playerCardsSep1.length > 0 && playerCardsSep2.length > 0)
        playerVal = Math.max(computeHandValue(playerCardsSep1), computeHandValue(playerCardsSep2));
    else
        playerVal = computeHandValue(playerCards);

    // El dealer pide cartas mientras tenga menos de 17 y menos que el jugador
    while (dealerVal < 17 && dealerVal <= playerVal) {
        const c = deck.pop();
        dealerCards.push(c);
        addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
        await delay(700);
        dealerVal = computeHandValue(dealerCards);
        document.getElementById("dealer-sum").innerText = dealerVal;
    }

    mostrarResultado();
}

// Solo revela la carta oculta (cuando el jugador ya se pasó)
function revealDealerOnly() {
    const hiddenImg = document.querySelector("#dealer-cards img:first-child");
    if (hiddenImg && hiddenCard)
        hiddenImg.src = BASE + "/games/blackjack/cartas/" + formatCardName(hiddenCard) + ".png";
    document.getElementById("dealer-sum").innerText = computeHandValue(dealerCards);
    mostrarResultado();
}

// El jugador dobla la apuesta y recibe exactamente una carta más
function doblar() {
    if (!canHit || currentBet === 0) return;
    if (chips < currentBet) {
        document.getElementById("Resultado").innerText = "No tienes suficientes fichas para doblar.";
        return;
    }

    chips      -= currentBet;
    setFichas(chips);
    currentBet *= 2; // la apuesta se dobla
    updateChips();

    const c = deck.pop();
    playerCards.push(c);
    addCardAnimated("player-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
    document.getElementById("player-sum").innerText = computeHandValue(playerCards);

    canHit = false;
    document.getElementById("Pedir").disabled   = true;
    document.getElementById("Doblar").disabled  = true;
    document.getElementById("Separar").disabled = true;

    setTimeout(revealDealerAndPlay, 800);
}

// Variables para manos divididas (split)
let playerCardsSep1 = [];
let playerCardsSep2 = [];
let activeHand      = 0; // 0 = sin split, 1 = mano 1, 2 = mano 2

// El jugador separa dos cartas iguales en dos manos independientes
function separar() {
    if (!canHit || currentBet === 0 || playerCards.length !== 2) return;

    const [c1, c2] = playerCards;
    if (c1.split("-")[0] !== c2.split("-")[0]) {
        document.getElementById("Resultado").innerText = "Solo puedes separar si tienes dos cartas iguales.";
        return;
    }
    if (chips < currentBet) {
        document.getElementById("Resultado").innerText = "No tienes suficientes fichas para separar.";
        return;
    }

    chips -= currentBet; // pagar la segunda apuesta
    setFichas(chips);
    updateChips();

    playerCardsSep1 = [c1];
    playerCardsSep2 = [c2];
    activeHand      = 1;
    playerCards     = playerCardsSep1;
    canHit          = true;

    // Mostrar el contenedor de manos divididas
    document.getElementById("player-cards").innerHTML    = "";
    document.getElementById("split-hands").style.display = "flex";
    document.getElementById("hand1").style.display       = "block";
    document.getElementById("hand2").style.display       = "block";
    document.getElementById("player-cards1").innerHTML   = "";
    document.getElementById("player-cards2").innerHTML   = "";

    // Mostrar la carta original de cada mano
    addCardAnimated("player-cards1", BASE + "/games/blackjack/cartas/" + formatCardName(c1) + ".png");
    addCardAnimated("player-cards2", BASE + "/games/blackjack/cartas/" + formatCardName(c2) + ".png");

    // Repartir una carta extra a cada mano
    playerCardsSep1.push(deck.pop());
    addCardAnimated("player-cards1", BASE + "/games/blackjack/cartas/" + formatCardName(playerCardsSep1[1]) + ".png");

    playerCardsSep2.push(deck.pop());
    addCardAnimated("player-cards2", BASE + "/games/blackjack/cartas/" + formatCardName(playerCardsSep2[1]) + ".png");

    document.getElementById("player-sum1").innerText = computeHandValue(playerCardsSep1);
    document.getElementById("player-sum2").innerText = computeHandValue(playerCardsSep2);

    document.getElementById("Resultado").innerText    = "▶ Jugando Mano 1";
    document.getElementById("Pedir").disabled         = false;
    document.getElementById("Quedarse").disabled      = false;
    document.getElementById("Doblar").disabled        = true;
    document.getElementById("Separar").disabled       = true;
}

// Cambia de la mano 1 a la mano 2 en el split, o termina si ya jugó las dos
function cambiarMano() {
    if (activeHand === 1) {
        activeHand  = 2;
        playerCards = playerCardsSep2;
        canHit      = true;
        document.getElementById("player-sum").innerText   = computeHandValue(playerCardsSep2);
        document.getElementById("Resultado").innerText    = "👉 Ahora juegas con la Mano 2";
        document.getElementById("Pedir").disabled         = false;
        document.getElementById("Quedarse").disabled      = false;
    } else {
        activeHand = 0;
        canHit     = false;
        document.getElementById("Pedir").disabled    = true;
        document.getElementById("Quedarse").disabled = true;
        revealDealerAndPlay();
    }
}

// Muestra el resultado final de la ronda
function mostrarResultado() {
    const dealerFinal = computeHandValue(dealerCards);

    if (playerCardsSep1.length > 0 && playerCardsSep2.length > 0) {
        // En split no hay blackjack natural (se pasa null como mano)
        const msg = "Mano 1: " + evaluarMano(computeHandValue(playerCardsSep1), dealerFinal, null) + "<br>"
                  + "Mano 2: " + evaluarMano(computeHandValue(playerCardsSep2), dealerFinal, null);
        document.getElementById("Resultado").innerHTML = msg;
    } else {
        document.getElementById("Resultado").innerText = evaluarMano(computeHandValue(playerCards), dealerFinal, playerCards);
    }

    updateChips();
    if (chips <= 0) checkGameOver();

    // Calcular ganancia real para guardar en BD
    const gananciaParaDB = Math.max(0, chips - saldoAntesDeBet + apuestaDeBD);
    guardarPartidaBJ(gananciaParaDB);

    document.getElementById("Apostar").disabled  = false;
    document.getElementById("Pedir").disabled    = true;
    document.getElementById("Quedarse").disabled = true;
    document.getElementById("Doblar").disabled   = true;
    document.getElementById("Separar").disabled  = true;
}

// Compara la mano del jugador con la del dealer y decide el resultado.
// handCards: array de cartas de esa mano (null en split, donde no hay blackjack natural)
function evaluarMano(playerFinal, dealerFinal, handCards) {
    if (handCards && handCards.length === 2 && playerFinal === 21) {
        chips += currentBet * 2; setFichas(chips);
        return "¡Blackjack! Ganaste el doble.";
    }
    if (dealerFinal === 21 && dealerCards.length === 2) {
        return "Dealer tiene Blackjack. Pierdes automáticamente.";
    }
    if (playerFinal > 21) {
        return "Te pasaste. Pierdes.";
    } else if (dealerFinal > 21) {
        chips += currentBet * 2; setFichas(chips);
        return "Dealer se pasó. ¡Ganas!";
    } else if (playerFinal > dealerFinal) {
        chips += currentBet * 2; setFichas(chips);
        return "¡Ganaste!";
    } else if (playerFinal === dealerFinal) {
        chips += currentBet; setFichas(chips);
        return "Empate.";
    } else {
        return "Pierdes.";
    }
}

// Calcula el valor total de una mano.
// Los ases valen 11, pero se reducen a 1 si el total supera 21.
function computeHandValue(cardsArray) {
    let sum = 0, aceCount = 0;
    for (let card of cardsArray) {
        const v = card.split("-")[0];
        if (v === "A")                      { sum += 11; aceCount++; }
        else if (["J","Q","K"].includes(v)) { sum += 10; }
        else                                { sum += parseInt(v); }
    }
    // Convertir ases de 11 a 1 si es necesario para no pasarse
    while (sum > 21 && aceCount > 0) { sum -= 10; aceCount--; }
    return sum;
}

// Convierte el código de carta (ej: "A-H") al nombre del archivo de imagen (ej: "A_hearts")
function formatCardName(card) {
    const suits = { C: "clubs", D: "diamonds", H: "hearts", S: "spades" };
    const [value, suit] = card.split("-");
    return `${value}_${suits[suit]}`;
}

// Crea una imagen de carta y la añade al contenedor con animación
function addCardAnimated(containerId, src) {
    const img = document.createElement("img");
    img.src = src;
    img.style.animation = "dealIn 0.6s ease forwards";
    document.getElementById(containerId).appendChild(img);
}

// Pausa la ejecución durante 'ms' milisegundos (para animar con async/await)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Actualiza el contador de fichas en pantalla y en localStorage
function updateChips() {
    setFichas(chips);
    document.getElementById("chips").innerText = chips;
}

// Comprueba si el jugador se quedó sin fichas y bloquea el juego
function checkGameOver() {
    if (chips <= 0) {
        document.getElementById("Resultado").innerText  = "💀 ¡Te has quedado sin fichas! Reinicia el juego para volver a jugar.";
        document.getElementById("Apostar").disabled     = true;
        document.getElementById("Pedir").disabled       = true;
        document.getElementById("Quedarse").disabled    = true;
    }
}

// Guardar el saldo automáticamente al salir o cambiar de página
window.addEventListener('pagehide', () => {
    navigator.sendBeacon(
        BASE + '/api/guardar_saldo.php',
        new Blob([JSON.stringify({ saldo: chips })], { type: 'application/json' })
    );
});

// Alternar música de fondo entre encendida y silenciada
function toggleMusic() {
    const music = document.getElementById("bg-music");
    const btn   = document.getElementById("toggle-music");
    if (music.paused) { music.play().catch(() => {});  btn.innerText = "🔇 Silenciar"; }
    else              { music.pause(); btn.innerText = "🔊 Música"; }
}
