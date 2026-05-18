const BASE       = document.body.dataset.base || '';
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

function stopReel(reel, interval, delay, finalSymbol) {
    return new Promise(resolve => {
        setTimeout(() => {
            clearInterval(interval);
            reel.classList.remove('spinning');
            reel.textContent = finalSymbol;
            resolve();
        }, delay);
    });
}

lever.addEventListener("click", async () => {
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

    try {
        const response = await fetch(BASE + '/api/tragaperras.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apuesta })
        });

        const result = await response.json();

        if (!response.ok) {
            intervals.forEach(clearInterval);
            reels.forEach(r => r.classList.remove('spinning'));
            mostrarMensaje("❌ " + (result.error || "Error al jugar."), "error");
            return;
        }

        await Promise.all([
            stopReel(reels[0], intervals[0], 800,  result.resultado[0]),
            stopReel(reels[1], intervals[1], 1400, result.resultado[1]),
            stopReel(reels[2], intervals[2], 2000, result.resultado[2]),
        ]);

        if (saldoDisplay) saldoDisplay.textContent = result.saldo;

        if (result.ganancia > 0) {
            mostrarMensaje("🎉 ¡Premio! Ganaste " + result.ganancia + " fichas.", "premio");
            reels.forEach(r => r.classList.add('win'));
            setTimeout(() => reels.forEach(r => r.classList.remove('win')), 1500);
        } else {
            mostrarMensaje("😞 Sin premio.", "nada");
        }

    } catch (err) {
        intervals.forEach(clearInterval);
        reels.forEach(r => r.classList.remove('spinning'));
        mostrarMensaje("❌ Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
        girando = false;
        lever.classList.remove('active');
    }
});

function mostrarMensaje(texto, tipo) {
    resultMsg.textContent = texto;
    resultMsg.className = "mensaje-premio" + (tipo ? " " + tipo : "");
}

const toggleBtn = document.getElementById("toggle-music");
const bgMusic   = document.getElementById("bg-music");
if (toggleBtn && bgMusic) {
    toggleBtn.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(() => {});
            toggleBtn.textContent = "🔇 Silenciar";
        } else {
            bgMusic.pause();
            toggleBtn.textContent = "🔊 Música";
        }
    });
}
