const lever      = document.getElementById("lever");
const resultMsg  = document.getElementById("result-message");
const saldoDisplay = document.getElementById("saldo-display");

const SIMBOLOS = ['🍒', '🍋', '🔔', '⭐', '🍀', '7️⃣'];
let girando = false;

function startSpinning(reels) {
    return reels.map(reel => {
        reel.classList.add('spinning');
        return setInterval(() => {
            reel.textContent = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
        }, 80);
    });
}

lever.addEventListener("click", function() {
    if (girando) return;

    const apuesta = parseInt(document.getElementById("apuesta-valor").value, 10);
    if (!apuesta || apuesta < 1 || apuesta > 20) {
        mostrarMensaje("⚠️ La apuesta debe estar entre 1 y 20.", "error");
        return;
    }

    girando = true;
    lever.classList.add('active');
    mostrarMensaje("🎰 Girando...", "");

    const reels = Array.from(document.querySelectorAll('.reel'));
    const intervals = startSpinning(reels);

    fetch(BASE + '/api/tragaperras.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apuesta: apuesta })
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
        if (result.error) {
            intervals.forEach(clearInterval);
            reels.forEach(function(r) { r.classList.remove('spinning'); });
            mostrarMensaje("❌ " + result.error, "error");
            girando = false;
            lever.classList.remove('active');
            return;
        }

        setTimeout(function() {
            clearInterval(intervals[0]);
            reels[0].classList.remove('spinning');
            reels[0].textContent = result.resultado[0];
        }, 800);

        setTimeout(function() {
            clearInterval(intervals[1]);
            reels[1].classList.remove('spinning');
            reels[1].textContent = result.resultado[1];
        }, 1400);

        setTimeout(function() {
            clearInterval(intervals[2]);
            reels[2].classList.remove('spinning');
            reels[2].textContent = result.resultado[2];

            if (saldoDisplay) saldoDisplay.textContent = result.saldo;

            if (result.ganancia > 0) {
                mostrarMensaje("🎉 ¡Premio! Ganaste " + result.ganancia + " fichas.", "premio");
                reels.forEach(function(r) { r.classList.add('win'); });
                setTimeout(function() {
                    reels.forEach(function(r) { r.classList.remove('win'); });
                }, 1500);
            } else {
                mostrarMensaje("😞 Sin premio.", "nada");
            }

            girando = false;
            lever.classList.remove('active');
        }, 2000);
    })
    .catch(function() {
        intervals.forEach(clearInterval);
        reels.forEach(function(r) { r.classList.remove('spinning'); });
        mostrarMensaje("❌ Error de conexión. Inténtalo de nuevo.", "error");
        girando = false;
        lever.classList.remove('active');
    });
});

function mostrarMensaje(texto, tipo) {
    resultMsg.textContent = texto;
    resultMsg.className = "mensaje-premio" + (tipo ? " " + tipo : "");
}

const toggleBtn = document.getElementById("toggle-music");
const bgMusic   = document.getElementById("bg-music");
if (toggleBtn && bgMusic) {
    toggleBtn.addEventListener("click", function() {
        if (bgMusic.paused) {
            bgMusic.play().catch(function() {});
            toggleBtn.textContent = "🔇 Silenciar";
        } else {
            bgMusic.pause();
            toggleBtn.textContent = "🔊 Música";
        }
    });
}
