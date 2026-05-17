// ============================================================
// TRAGAPERRAS - Lógica del juego
// Al pulsar la palanca, se envía la apuesta al servidor (API),
// que devuelve 3 símbolos aleatorios y el resultado.
// ============================================================

const BASE       = document.body.dataset.base || ''; // URL base del proyecto
const lever      = document.getElementById("lever");
const resultMsg  = document.getElementById("result-message");
const saldoDisplay = document.getElementById("saldo-display");

const SIMBOLOS = ['🍒', '🍋', '🔔', '⭐', '🍀', '7️⃣']; // símbolos posibles
let girando = false; // evita múltiples tiradas simultáneas

// Pone los rodillos a girar (cambian de símbolo rápidamente)
// Devuelve los intervalos para poder pararlos después
function startSpinning(reels) {
    return reels.map(reel => {
        reel.classList.add('spinning');
        return setInterval(() => {
            reel.textContent = SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
        }, 80);
    });
}

// Para un rodillo después de 'delay' ms y lo deja en 'finalSymbol'
// Devuelve una promesa para poder esperar a que todos paren
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

// Evento principal: clic en la palanca
lever.addEventListener("click", async () => {
    if (girando) return; // ignorar si ya está girando

    const apuesta = parseInt(document.getElementById("apuesta-valor").value, 10);
    if (!apuesta || apuesta < 1 || apuesta > 20) {
        mostrarMensaje("⚠️ La apuesta debe estar entre 1 y 20.", "error");
        return;
    }

    girando = true;
    lever.classList.add('active');
    mostrarMensaje("🎰 Girando...", "");

    const reels = Array.from(document.querySelectorAll('.reel'));
    const intervals = startSpinning(reels); // empezar animación de giro

    try {
        // Enviar la apuesta al servidor y recibir el resultado
        const response = await fetch(BASE + '/api/tragaperras.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apuesta })
        });

        const result = await response.json();

        if (!response.ok) {
            // El servidor rechazó la jugada (saldo insuficiente, etc.)
            intervals.forEach(clearInterval);
            reels.forEach(r => r.classList.remove('spinning'));
            mostrarMensaje("❌ " + (result.error || "Error al jugar."), "error");
            return;
        }

        // Parar los rodillos de izquierda a derecha con pequeños retrasos
        await Promise.all([
            stopReel(reels[0], intervals[0], 800,  result.resultado[0]),
            stopReel(reels[1], intervals[1], 1400, result.resultado[1]),
            stopReel(reels[2], intervals[2], 2000, result.resultado[2]),
        ]);

        // Actualizar el saldo mostrado en pantalla
        if (saldoDisplay) saldoDisplay.textContent = result.saldo;

        // Mostrar si hubo premio o no
        if (result.ganancia > 0) {
            mostrarMensaje("🎉 ¡Premio! Ganaste " + result.ganancia + " fichas.", "premio");
            reels.forEach(r => r.classList.add('win'));
            setTimeout(() => reels.forEach(r => r.classList.remove('win')), 1500);
        } else {
            mostrarMensaje("😞 Sin premio.", "nada");
        }

    } catch (err) {
        // Error de red o del servidor
        intervals.forEach(clearInterval);
        reels.forEach(r => r.classList.remove('spinning'));
        mostrarMensaje("❌ Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
        girando = false;
        lever.classList.remove('active');
    }
});

// Muestra un mensaje de resultado con el estilo correspondiente
function mostrarMensaje(texto, tipo) {
    resultMsg.textContent = texto;
    resultMsg.className = "mensaje-premio" + (tipo ? " " + tipo : "");
}

// Control de música de fondo
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
