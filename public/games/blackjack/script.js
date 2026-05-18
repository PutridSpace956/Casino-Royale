let deck        = [];
let dealerCards = [];
let playerCards = [];
let hiddenCard  = null;
let canHit      = false;

let chips      = getFichas();
let currentBet = 0;

let saldoAntesDeBet = 0;
let apuestaDeBD     = 0;


function guardarPartidaBJ(ganancia) {
    fetch(BASE + '/api/guardar_partida.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ juego: 'blackjack', apuesta: apuestaDeBD, ganancia, saldo: chips })
    }).catch(() => {});
}

function getFichas() {
    let fichas = parseInt(localStorage.getItem("fichas"));
    if (isNaN(fichas)) {
        fichas = 50;
        localStorage.setItem("fichas", fichas);
    }
    return fichas;
}

function setFichas(valor) {
    localStorage.setItem("fichas", valor);
}

window.onload = function() {
    document.getElementById("Apostar").addEventListener("click", apostar);
    document.getElementById("Pedir").addEventListener("click", pedir);
    document.getElementById("Quedarse").addEventListener("click", quedarse);
    document.getElementById("Doblar").addEventListener("click", doblar);
    document.getElementById("toggle-music").addEventListener("click", toggleMusic);

    buildDeck();
    shuffleDeck();
    updateChips();

    // los navegadores bloquean el audio hasta que el usuario interactua
    const music = document.getElementById("bg-music");
    document.body.addEventListener("click", () => {
        music.volume = 0.3;
        music.play().catch(() => {});
    }, { once: true });
};

function buildDeck() {
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits  = ["C","D","H","S"];
    deck = [];
    for (let s of suits)
        for (let v of values)
            deck.push(`${v}-${s}`);
}

// mezcla la baraja con Fisher-Yates
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

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

    document.getElementById("Apostar").disabled  = true;
    document.getElementById("Pedir").disabled    = false;
    document.getElementById("Quedarse").disabled = false;
    document.getElementById("Doblar").disabled   = false;

    buildDeck();
    shuffleDeck();
    startGame();
}

function startGame() {
    dealerCards = [];
    playerCards = [];
    hiddenCard  = null;
    canHit      = true;

    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("Resultado").innerText    = "";
    document.getElementById("dealer-sum").innerText   = "?";
    document.getElementById("player-sum").innerText   = "";

    // primera carta del dealer boca abajo
    hiddenCard = deck.pop();
    dealerCards.push(hiddenCard);
    addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/back.png");

    const dealerVisible = deck.pop();
    dealerCards.push(dealerVisible);
    addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/" + formatCardName(dealerVisible) + ".png");

    for (let i = 0; i < 2; i++) {
        const c = deck.pop();
        playerCards.push(c);
        addCardAnimated("player-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
    }

    const playerVal = computeHandValue(playerCards);
    document.getElementById("player-sum").innerText = playerVal;

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

function pedir() {
    if (!canHit) return;

    const c = deck.pop();
    playerCards.push(c);
    addCardAnimated("player-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");

    const playerVal = computeHandValue(playerCards);
    document.getElementById("player-sum").innerText = playerVal;

    if (playerVal > 21) {
        canHit = false;
        setTimeout(revealDealerOnly, 800);
    }
}

function quedarse() {
    if (!canHit) return;
    canHit = false;
    revealDealerAndPlay();
}

function revealDealerAndPlay() {
    const hiddenImg = document.querySelector("#dealer-cards img:first-child");
    if (hiddenImg && hiddenCard)
        hiddenImg.src = BASE + "/games/blackjack/cartas/" + formatCardName(hiddenCard) + ".png";

    let dealerVal   = computeHandValue(dealerCards);
    const playerVal = computeHandValue(playerCards);
    document.getElementById("dealer-sum").innerText = dealerVal;

    // el dealer sigue pidiendo cartas hasta llegar a 17
    while (dealerVal < 17 && dealerVal <= playerVal) {
        const c = deck.pop();
        dealerCards.push(c);
        addCardAnimated("dealer-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
        dealerVal = computeHandValue(dealerCards);
        document.getElementById("dealer-sum").innerText = dealerVal;
    }

    mostrarResultado();
}

function revealDealerOnly() {
    const hiddenImg = document.querySelector("#dealer-cards img:first-child");
    if (hiddenImg && hiddenCard)
        hiddenImg.src = BASE + "/games/blackjack/cartas/" + formatCardName(hiddenCard) + ".png";
    document.getElementById("dealer-sum").innerText = computeHandValue(dealerCards);
    mostrarResultado();
}

function doblar() {
    if (!canHit || currentBet === 0) return;
    if (chips < currentBet) {
        document.getElementById("Resultado").innerText = "No tienes suficientes fichas para doblar.";
        return;
    }

    chips      -= currentBet;
    setFichas(chips);
    currentBet *= 2;
    updateChips();

    const c = deck.pop();
    playerCards.push(c);
    addCardAnimated("player-cards", BASE + "/games/blackjack/cartas/" + formatCardName(c) + ".png");
    document.getElementById("player-sum").innerText = computeHandValue(playerCards);

    canHit = false;
    document.getElementById("Pedir").disabled  = true;
    document.getElementById("Doblar").disabled = true;

    setTimeout(revealDealerAndPlay, 800);
}

function mostrarResultado() {
    const dealerFinal = computeHandValue(dealerCards);
    document.getElementById("Resultado").innerText = evaluarMano(computeHandValue(playerCards), dealerFinal, playerCards);

    updateChips();
    if (chips <= 0) checkGameOver();

    const gananciaParaDB = Math.max(0, chips - saldoAntesDeBet + apuestaDeBD);
    guardarPartidaBJ(gananciaParaDB);

    document.getElementById("Apostar").disabled  = false;
    document.getElementById("Pedir").disabled    = true;
    document.getElementById("Quedarse").disabled = true;
    document.getElementById("Doblar").disabled   = true;
}

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

// los ases valen 11 pero se bajan a 1 si te pasas de 21
function computeHandValue(cardsArray) {
    let sum = 0, aceCount = 0;
    for (let card of cardsArray) {
        const v = card.split("-")[0];
        if (v === "A")                      { sum += 11; aceCount++; }
        else if (["J","Q","K"].includes(v)) { sum += 10; }
        else                                { sum += parseInt(v); }
    }
    while (sum > 21 && aceCount > 0) { sum -= 10; aceCount--; }
    return sum;
}

function formatCardName(card) {
    const suits = { C: "clubs", D: "diamonds", H: "hearts", S: "spades" };
    const [value, suit] = card.split("-");
    return `${value}_${suits[suit]}`;
}

function addCardAnimated(containerId, src) {
    const img = document.createElement("img");
    img.src = src;
    img.style.animation = "dealIn 0.6s ease forwards";
    document.getElementById(containerId).appendChild(img);
}

function updateChips() {
    setFichas(chips);
    document.getElementById("chips").innerText = chips;
}

function checkGameOver() {
    if (chips <= 0) {
        document.getElementById("Resultado").innerText  = "💀 ¡Te has quedado sin fichas! Reinicia el juego para volver a jugar.";
        document.getElementById("Apostar").disabled     = true;
        document.getElementById("Pedir").disabled       = true;
        document.getElementById("Quedarse").disabled    = true;
    }
}

function toggleMusic() {
    const music = document.getElementById("bg-music");
    const btn   = document.getElementById("toggle-music");
    if (music.paused) { music.play().catch(() => {});  btn.innerText = "🔇 Silenciar"; }
    else              { music.pause(); btn.innerText = "🔊 Música"; }
}
