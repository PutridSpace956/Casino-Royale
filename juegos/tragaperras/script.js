const symbolWeights = [
  { symbol: "🍒", weight: 5 },
  { symbol: "🍋", weight: 4 },
  { symbol: "🔔", weight: 2 },
  { symbol: "⭐", weight: 2 },
  { symbol: "🍀", weight: 1 },
  { symbol: "7️⃣", weight: 0.5 }
];

const payouts = {
  "🍒": 5,
  "🍋": 10,
  "🔔": 25,
  "⭐": 50,
  "🍀": 100,
  "7️⃣": 500
};

const reels = [...document.querySelectorAll(".reel")];
const lever = document.getElementById("lever");

const sonidoPalanca = document.getElementById("sonido-palanca");
const sonidoPremio = document.getElementById("sonido-premio");
const sonidoNada = document.getElementById("sonido-nada");

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

let chips = getFichas();
let currentBet = 0;
let hideMsgTimeout = null;
let bloqueoPalanca = false;

const fichasContainer = document.createElement("div");
fichasContainer.id = "fichas-container";
fichasContainer.innerHTML = `Fichas: <span id="fichas">${chips}</span>`;
fichasContainer.style.color = "white";
fichasContainer.style.backgroundColor = "darkblue";
fichasContainer.style.marginTop = "1rem";
fichasContainer.style.padding = "1rem";
fichasContainer.style.border = "2px solid black";
fichasContainer.style.borderRadius = "10px";
document.querySelector("main.slot").insertBefore(
  fichasContainer,
  document.getElementById("apuesta-container")
);

function updateChips() {
  setFichas(chips);
  document.getElementById("fichas").textContent = chips;
}

function getRandomSymbol() {
  const totalWeight = symbolWeights.reduce((sum, s) => sum + s.weight, 0);
  let rnd = Math.random() * totalWeight;
  for (let s of symbolWeights) {
    if (rnd < s.weight) return s.symbol;
    rnd -= s.weight;
  }
  return symbolWeights[symbolWeights.length - 1].symbol;
}

function spinReel(reel, delay) {
  return new Promise(resolve => {
    const container = document.createElement("div");
    container.className = "symbols";

    const symbolHeight = reel.getBoundingClientRect().height || 150;
    const totalSymbols = 40;

    for (let i = 0; i < totalSymbols; i++) {
      const sym = getRandomSymbol();
      const div = document.createElement("div");
      div.className = "symbol";
      div.textContent = sym;
      container.appendChild(div);
    }

    reel.innerHTML = "";
    reel.appendChild(container);

    let position = 0;
    let speed = symbolHeight / 10;
    const stopTime = 4500 + delay;
    const start = Date.now();

    function animate() {
      const elapsed = Date.now() - start;
      if (elapsed >= stopTime) {
        const rawIndex = Math.round(position / symbolHeight);
        const index = ((rawIndex % totalSymbols) + totalSymbols) % totalSymbols;
        const offset = index * symbolHeight;
        const reelHeight = reel.getBoundingClientRect().height;
        const correction = (symbolHeight - reelHeight) / 2;

        container.style.transition = "transform 0.5s ease-out";
        container.style.transform = `translateY(-${offset - correction}px)`;

        const finalSymbol = container.children[index]?.textContent || getRandomSymbol();

        const onDone = () => {
          container.removeEventListener("transitionend", onDone);
          resolve(finalSymbol);
        };
        container.addEventListener("transitionend", onDone);
        setTimeout(onDone, 600);
        return;
      }

      position += speed;
      container.style.transform = `translateY(-${position}px)`;

      if (speed > 2) speed *= 0.98;

      requestAnimationFrame(animate);
    }

    animate();
  });
}

function checkResult(finalSymbols) {
  const resultDiv = document.getElementById("result-message");
  const [a, b, c] = finalSymbols;

  if (a === b && b === c) {
    const basePrize = payouts[a] || 0;
    const totalPrize = basePrize * currentBet;
    chips += totalPrize;
    setFichas(chips);
    updateChips();
    resultDiv.textContent = `🎉 ¡Premio! Tres ${a} iguales. Ganaste ${totalPrize} fichas 🎉`;
    resultDiv.style.color = "gold";
    sonidoPremio.currentTime = 0;
    sonidoPremio.play().catch(() => {});
  } else {
    resultDiv.textContent = "😢 Sin premio esta vez. ¡Sigue intentando!";
    resultDiv.style.color = "gray";
    sonidoNada.currentTime = 0;
    sonidoNada.play().catch(() => {});
  }

  if (hideMsgTimeout) clearTimeout(hideMsgTimeout);
  hideMsgTimeout = setTimeout(() => {
    resultDiv.textContent = "";
  }, 4000);
}

function spinReels() {
  const p1 = spinReel(reels[0], 0);
  const p2 = spinReel(reels[1], 500);
  const p3 = spinReel(reels[2], 1000);

  return Promise.all([p1, p2, p3]).then(finalSymbols => {
    checkResult(finalSymbols);
  });
}


function getApuesta() {
  const valor = parseInt(document.getElementById("apuesta-valor").value);
  if (isNaN(valor) || valor < 1 || valor > 10) return null;
  return valor;
}

lever.addEventListener("click", () => {
  if (bloqueoPalanca || lever.classList.contains("active")) return;

  const apuesta = getApuesta();
  const resultDiv = document.getElementById("result-message");
  resultDiv.textContent = "";

  if (apuesta === null) {
    resultDiv.textContent = "❌ Apuesta inválida. Debe ser entre 1 y 10 fichas.";
    resultDiv.style.color = "red";
    return;
  }

  if (chips < apuesta) {
    resultDiv.textContent = "❌ No tienes suficientes fichas para esa apuesta.";
    resultDiv.style.color = "red";
    return;
  }

  currentBet = apuesta;
  chips -= currentBet;
  setFichas(chips);
  updateChips();

  bloqueoPalanca = true; // ⛔ Bloquear palanca
  lever.classList.add("active");

  sonidoPalanca.currentTime = 0;
  sonidoPalanca.play().catch(() => {});

  spinReels().then(() => {
    lever.classList.remove("active");
    bloqueoPalanca = false; // ✅ Desbloquear palanca tras resultado
  });
});


reels.forEach(reel => {
  const sym = getRandomSymbol();
  const div = document.createElement("div");
  div.className = "symbol";
  div.textContent = sym;

  const container = document.createElement("div");
  container.className = "symbols";
  container.appendChild(div);

  reel.innerHTML = "";
  reel.appendChild(container);
});

updateChips();

window.addEventListener("storage", () => {
  chips = getFichas();
  updateChips();
});