let deck = [];
let dealerCards = [];
let playerCards = [];
let hiddenCard = null;
let canHit = false;

let chips = getFichas();
let currentBet = 0;

const sonidos = {
  ganar: new Audio("./audio/ganar.mp3"),
  perder: new Audio("./audio/perder.mp3"),
  empate: new Audio("./audio/empate.mp3")
};

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
  document.getElementById("Separar").addEventListener("click", separar);
  document.getElementById("toggle-music").addEventListener("click", toggleMusic);

  buildDeck();
  shuffleDeck();
  updateChips();

  const music = document.getElementById("bg-music");
  document.body.addEventListener("click", () => {
    music.volume = 0.3;
    music.play().catch(() => {});
  }, { once: true });
};

function buildDeck() {
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["C","D","H","S"];
  deck = [];
  for (let s of suits) for (let v of values) deck.push(`${v}-${s}`);
}

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

  currentBet = betValue;
  chips -= currentBet;
  setFichas(chips);
  updateChips();

  if (chips <= 0) checkGameOver();

  document.getElementById("Apostar").disabled = true;
  document.getElementById("Pedir").disabled = false;
  document.getElementById("Quedarse").disabled = false;
  document.getElementById("Doblar").disabled = false;
  document.getElementById("Separar").disabled = false;

  buildDeck();
  shuffleDeck();
  startGame();
}

function resetSplitUI() {
  document.getElementById("split-hands").style.display = "none";
  document.getElementById("player-cards1").innerHTML = "";
  document.getElementById("player-cards2").innerHTML = "";
  document.getElementById("player-sum1").innerText = "0";
  document.getElementById("player-sum2").innerText = "0";
}

async function startGame() {
  resetSplitUI();

  dealerCards = [];
  playerCards = [];
  hiddenCard = null;
  canHit = true;

  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("Resultado").innerText = "";
  document.getElementById("dealer-sum").innerText = "?";
  document.getElementById("player-sum").innerText = "";

  hiddenCard = deck.pop();
  dealerCards.push(hiddenCard);
  addCardAnimated("dealer-cards", "./cartas/back.png");

  await delay(600);
  const dealerVisible = deck.pop();
  dealerCards.push(dealerVisible);
  addCardAnimated("dealer-cards", "./cartas/" + formatCardName(dealerVisible) + ".png");

  await delay(600);
  for (let i = 0; i < 2; i++) {
    const c = deck.pop();
    playerCards.push(c);
    addCardAnimated("player-cards", "./cartas/" + formatCardName(c) + ".png");
    await delay(600);
  }

  const playerVal = computeHandValue(playerCards);
  document.getElementById("player-sum").innerText = playerVal;

  const dealerVal = computeHandValue(dealerCards);
  if (dealerVal === 21) {
    canHit = false;

    const hiddenImg = document.querySelector("#dealer-cards img:first-child");
    if (hiddenImg && hiddenCard) {
      hiddenImg.src = "./cartas/" + formatCardName(hiddenCard) + ".png";
    }

    document.getElementById("dealer-sum").innerText = dealerVal;

    document.getElementById("Resultado").innerText = "Dealer tiene Blackjack. Pierdes automáticamente.";
    document.getElementById("Apostar").disabled = false;
    sonidos.perder.play();
    return;
  }

  if (playerVal === 21) {
    canHit = false;
    document.getElementById("Resultado").innerText = "¡Blackjack!";
    chips += currentBet * 2;
    setFichas(chips);
    updateChips();
    document.getElementById("Apostar").disabled = false;
    return;
  }

  if(playerVal === 21 && playerVal === dealerVal){
    canHit = false;
    document.getElementById("Resultado").innerText = "Ambos teneis blackjack, Empate"
    document.getElementById("Apostar").disabled = false;
    return;
  }
}


function pedir() {
  if (!canHit) return;

  const c = deck.pop();
  playerCards.push(c);
  addCardAnimated(activeHand === 1 ? "player-cards1" : activeHand === 2 ? "player-cards2" : "player-cards",
                  "./cartas/" + formatCardName(c) + ".png");

  const playerVal = computeHandValue(playerCards);
  if (activeHand === 1) document.getElementById("player-sum1").innerText = playerVal;
  else if (activeHand === 2) document.getElementById("player-sum2").innerText = playerVal;
  else document.getElementById("player-sum").innerText = playerVal;

  if (playerVal > 21) {
    canHit = false;
    setTimeout(() => {
      if (activeHand === 1 || activeHand === 2) cambiarMano();
      else revealDealerOnly();
    }, 800);
  }
}

function quedarse() {
  if (!canHit) return;
  canHit = false;

  if (activeHand === 1 || activeHand === 2) {
    cambiarMano();
  } else {
    revealDealerAndPlay();
  }
}

async function revealDealerAndPlay() {
  const hiddenImg = document.querySelector("#dealer-cards img:first-child");
  if (hiddenImg && hiddenCard) {
    hiddenImg.src = "./cartas/" + formatCardName(hiddenCard) + ".png";
  }

  await delay(600);

  let dealerVal = computeHandValue(dealerCards);
  document.getElementById("dealer-sum").innerText = dealerVal;

  let playerVal;
  if (playerCardsSep1.length > 0 && playerCardsSep2.length > 0) {
    playerVal = Math.max(computeHandValue(playerCardsSep1), computeHandValue(playerCardsSep2));
  } else {
    playerVal = computeHandValue(playerCards);
  }

  while (dealerVal < 17 && dealerVal <= playerVal) {
    const c = deck.pop();
    dealerCards.push(c);
    addCardAnimated("dealer-cards", "./cartas/" + formatCardName(c) + ".png");
    await delay(700);
    dealerVal = computeHandValue(dealerCards);
    document.getElementById("dealer-sum").innerText = dealerVal;
  }

  mostrarResultado();
}

function revealDealerOnly() {
  const hiddenImg = document.querySelector("#dealer-cards img:first-child");
  if (hiddenImg && hiddenCard) {
    hiddenImg.src = "./cartas/" + formatCardName(hiddenCard) + ".png";
  }
  document.getElementById("dealer-sum").innerText = computeHandValue(dealerCards);
  mostrarResultado();
}


function doblar(){
  if(!canHit || currentBet === 0) return;

  if(chips < currentBet){
    document.getElementById("Resultado").innerText = "No tienes suficientes fichas para doblar.";
    return;
  }

  chips -= currentBet;
  setFichas(chips);
  currentBet *= 2;
  updateChips();

  const c = deck.pop();
  playerCards.push(c);
  addCardAnimated("player-cards", "./cartas/" + formatCardName(c) + ".png");

  const playerVal = computeHandValue(playerCards);
  document.getElementById("player-sum").innerText = playerVal;

  canHit = false;

  document.getElementById("Pedir").disabled = true;
  document.getElementById("Doblar").disabled = true;
  document.getElementById("Separar").disabled = true;

  setTimeout(revealDealerAndPlay, 800);
}

let playerCardsSep1 = [];
let playerCardsSep2 = [];
let activeHand = 0;

function separar(){
  if(!canHit || currentBet === 0) return;

  const [c1 , c2 ] = playerCards;
  if(c1.split("-")[0] !== c2.split("-")[0]){
    document.getElementById("Resultado").innerText = "Solo puedes separar si tienes dos cartas iguales.";
    return;
  }

  if(chips < currentBet){
    document.getElementById("Resultado").innerText = "No tienes suficientes fichas para separar.";
    return;
  }

  chips -= currentBet;
  setFichas(chips);
  updateChips();

  playerCardsSep1 = [c1];
  playerCardsSep2 = [c2];
  activeHand = 1;
  playerCards = playerCardsSep1;
  canHit = true;

  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("split-hands").style.display = "flex";

  playerCardsSep1.push(deck.pop());
  addCardAnimated("player-cards1", "./cartas/" + formatCardName(playerCardsSep1[playerCardsSep1.length - 1]) + ".png");

  playerCardsSep2.push(deck.pop());
  addCardAnimated("player-cards2", "./cartas/" + formatCardName(playerCardsSep2[playerCardsSep2.length - 1]) + ".png");

  document.getElementById("player-sum1").innerText = computeHandValue(playerCardsSep1);
  document.getElementById("player-sum2").innerText = computeHandValue(playerCardsSep2);

  document.getElementById("Pedir").disabled = false;
  document.getElementById("Quedarse").disabled = false;
  document.getElementById("Doblar").disabled = true;
  document.getElementById("Separar").disabled = true;
}

function cambiarMano() {
  if (activeHand === 1) {
    activeHand = 2;
    playerCards = playerCardsSep2;
    canHit = true;

    document.getElementById("player-sum").innerText = computeHandValue(playerCardsSep2);
    document.getElementById("Resultado").innerText = "👉 Ahora juegas con la Mano 2";

    document.getElementById("Pedir").disabled = false;
    document.getElementById("Quedarse").disabled = false;
  } else {
    activeHand = 0;
    canHit = false;

    document.getElementById("Pedir").disabled = true;
    document.getElementById("Quedarse").disabled = true;
    revealDealerAndPlay();
  }
}

function mostrarResultado() {
  const dealerFinal = computeHandValue(dealerCards);

  if (playerCardsSep1.length > 0 && playerCardsSep2.length > 0) {
    const playerFinal1 = computeHandValue(playerCardsSep1);
    const playerFinal2 = computeHandValue(playerCardsSep2);

    let msg = "";
    msg += "Mano 1: " + evaluarMano(playerFinal1, dealerFinal) + "<br>";
    msg += "Mano 2: " + evaluarMano(playerFinal2, dealerFinal);

    document.getElementById("Resultado").innerHTML = msg;
  } else {
    const playerFinal = computeHandValue(playerCards);
    const msg = evaluarMano(playerFinal, dealerFinal);
    document.getElementById("Resultado").innerText = msg;
  }

  updateChips();

  if (chips <= 0) checkGameOver();

  document.getElementById("Apostar").disabled = false;
  document.getElementById("Pedir").disabled = true;
  document.getElementById("Quedarse").disabled = true;
  document.getElementById("Doblar").disabled = true;
  document.getElementById("Separar").disabled = true;
}

function evaluarMano(playerFinal, dealerFinal) {
  if (playerFinal === 21 && playerCards.length === 2) {
    chips += currentBet * 2;
    setFichas(chips);
    sonidos.ganar.play();
    return "¡Blackjack! Ganaste el doble.";
  }

  if (dealerFinal === 21 && dealerCards.length === 2) {
    sonidos.perder.play();
    return "Dealer tiene Blackjack. Pierdes automáticamente.";
  }

  if (playerFinal > 21) {
    sonidos.perder.play();
    return "Te pasaste. Pierdes.";
  } else if (dealerFinal > 21) {
    chips += currentBet * 2;
    setFichas(chips);
    sonidos.ganar.play();
    return "Dealer se pasó. ¡Ganas!";
  } else if (playerFinal > dealerFinal) {
    chips += currentBet * 2;
    setFichas(chips);
    sonidos.ganar.play();
    return "¡Ganaste!";
  } else if (playerFinal === dealerFinal) {
    chips += currentBet;
    setFichas(chips);
    sonidos.empate.play();
    return "Empate.";
  } else {
    sonidos.perder.play();
    return "Pierdes.";
  }
}

function computeHandValue(cardsArray) {
  let sum = 0;
  let aceCount = 0;
  for (let card of cardsArray) {
    const v = card.split("-")[0];
    if (v === "A") { sum += 11; aceCount++; }
    else if (["J","Q","K"].includes(v)) sum += 10;
    else sum += parseInt(v);
  }
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateChips() {
  setFichas(chips);
  document.getElementById("chips").innerText = chips;
}


function checkGameOver() {
  if (chips <= 0) {
    document.getElementById("Resultado").innerText = "💀 ¡Te has quedado sin fichas! Reinicia el juego para volver a jugar.";
    document.getElementById("Apostar").disabled = true;
    document.getElementById("Pedir").disabled = true;
    document.getElementById("Quedarse").disabled = true;
  }
}

function toggleMusic() {
  const music = document.getElementById("bg-music");
  const btn = document.getElementById("toggle-music");
  if (music.paused) {
    music.play();
    btn.innerText = "🔇 Silenciar";
  } else {
    music.pause();
    btn.innerText = "🔊 Música";
  }
}