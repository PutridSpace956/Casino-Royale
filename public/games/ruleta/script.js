window.onload = function () {
    let fichasDisponibles = typeof SALDO_INICIAL !== 'undefined' ? SALDO_INICIAL : 50;
    let apuestaActual = 1;
    const fichasColocadas = {};
    let ultimaApuesta = {};

    const spanFichas     = document.getElementById("fichas-disponibles");
    const spanApuesta    = document.getElementById("apuesta-actual");
    const barraApuesta   = document.getElementById("barra-apuesta");
    const btnEliminar    = document.getElementById("eliminar-fichas");
    const resultadoTexto = document.getElementById("resultado-ruleta");
    const ruletaImg      = document.getElementById("ruleta");
    const btnGirar       = document.getElementById("girar-ruleta");
    const mesa           = document.getElementById("mesa");

    // colores oficiales de la ruleta europea
    const colores = {
        0: "green",
        1:"red",2:"black",3:"red",4:"black",5:"red",6:"black",
        7:"red",8:"black",9:"red",10:"black",11:"red",12:"black",
        13:"red",14:"black",15:"red",16:"black",17:"red",18:"black",
        19:"red",20:"black",21:"red",22:"black",23:"red",24:"black",
        25:"red",26:"black",27:"red",28:"black",29:"red",30:"black",
        31:"red",32:"black",33:"red",34:"black",35:"red",36:"black"
    };

    function inicializarColores() {
        const celdas = mesa.querySelectorAll("td");
        celdas.forEach(td => {
            const bet = td.getAttribute("data-bet");
            if (bet && !isNaN(bet)) {
                td.style.background = colores[parseInt(bet, 10)] || "rgba(0,0,0,0.25)";
            } else if (!td.classList.contains("vacio")) {
                td.style.background = "rgba(0,0,0,0.25)";
            }
        });
    }
    inicializarColores();

    barraApuesta.max = fichasDisponibles;

    function actualizarInfo() {
        barraApuesta.max   = fichasDisponibles;
        if (apuestaActual > fichasDisponibles)
            apuestaActual = fichasDisponibles > 0 ? fichasDisponibles : 1;
        barraApuesta.value      = apuestaActual;
        spanFichas.textContent  = fichasDisponibles;
        spanApuesta.textContent = apuestaActual;
    }
    actualizarInfo();

    barraApuesta.addEventListener("input", () => {
        apuestaActual = parseInt(barraApuesta.value, 10);
        actualizarInfo();
    });

    btnEliminar.addEventListener("click", () => {
        for (const key in fichasColocadas) fichasDisponibles += fichasColocadas[key];
        document.querySelectorAll(".ficha").forEach(f => f.remove());
        for (var k in fichasColocadas) delete fichasColocadas[k];
        actualizarInfo();
        resultadoTexto.innerHTML = `<b>Número ganador:</b> —`;
    });

    function colocarFichaEnCelda(celda) {
        if (!celda || celda.classList.contains("vacio")) return;
        const betKey = celda.getAttribute("data-bet") || celda.textContent.trim();
        if (!betKey) return;

        if (fichasDisponibles < apuestaActual) { alert("No tienes suficientes fichas"); return; }

        fichasDisponibles -= apuestaActual;
        fichasColocadas[betKey] = (fichasColocadas[betKey] || 0) + apuestaActual;

        let ficha = celda.querySelector(".ficha");
        if (!ficha) { ficha = document.createElement("div"); ficha.className = "ficha"; celda.appendChild(ficha); }
        ficha.textContent = fichasColocadas[betKey];
        actualizarInfo();
    }

    mesa.addEventListener("click", (e) => {
        const celda = e.target.closest("td");
        colocarFichaEnCelda(celda);
    });

    let anguloActual = 0;
    let girando = false;

    btnGirar.addEventListener("click", () => {
        if (girando) return;
        girando = true;

        // minimo 4 vueltas completas + angulo aleatorio
        const rotacion = 1440 + Math.floor(Math.random() * 360);
        anguloActual  += rotacion;
        ruletaImg.style.transform = `rotate(${anguloActual}deg)`;

        setTimeout(() => {
            girando = false;

            const numeroGanador = Math.floor(Math.random() * 37);
            const colorGanador  = colores[numeroGanador];

            let ganancia = 0;
            let perdida  = 0;
            let totalApostado = 0;
            for (var k in fichasColocadas) totalApostado += fichasColocadas[k];

            for (const apuesta in fichasColocadas) {
                const cantidad = fichasColocadas[apuesta];

                if (!isNaN(apuesta)) {
                    // numero exacto paga 35x
                    if (parseInt(apuesta, 10) === numeroGanador) ganancia += cantidad * 35;
                    else perdida += cantidad;
                }
                else if (apuesta === "RED" || apuesta === "BLACK") {
                    // color paga 2x
                    if ((apuesta === "RED"   && colorGanador === "red") ||
                        (apuesta === "BLACK" && colorGanador === "black")) ganancia += cantidad * 2;
                    else perdida += cantidad;
                }
                else if (apuesta === "EVEN" || apuesta === "ODD") {
                    // par/impar paga 2x, el 0 pierde siempre
                    if (numeroGanador !== 0 &&
                        ((apuesta === "EVEN" && numeroGanador % 2 === 0) ||
                         (apuesta === "ODD"  && numeroGanador % 2 === 1))) ganancia += cantidad * 2;
                    else perdida += cantidad;
                }
                else if (apuesta === "1-18" || apuesta === "19-36") {
                    // mitad paga 2x
                    if ((apuesta === "1-18"  && numeroGanador >= 1  && numeroGanador <= 18) ||
                        (apuesta === "19-36" && numeroGanador >= 19 && numeroGanador <= 36)) ganancia += cantidad * 2;
                    else perdida += cantidad;
                }
                else if (["1ST-12","2ND-12","3RD-12"].includes(apuesta)) {
                    // docena paga 3x
                    if ((apuesta === "1ST-12" && numeroGanador >= 1  && numeroGanador <= 12) ||
                        (apuesta === "2ND-12" && numeroGanador >= 13 && numeroGanador <= 24) ||
                        (apuesta === "3RD-12" && numeroGanador >= 25 && numeroGanador <= 36)) ganancia += cantidad * 3;
                    else perdida += cantidad;
                }
                else if (apuesta.startsWith("2TO1")) {
                    // columna paga 3x
                    const col1 = [1,4,7,10,13,16,19,22,25,28,31,34];
                    const col2 = [2,5,8,11,14,17,20,23,26,29,32,35];
                    const col3 = [3,6,9,12,15,18,21,24,27,30,33,36];
                    if ((apuesta === "2TO1-1" && col1.includes(numeroGanador)) ||
                        (apuesta === "2TO1-2" && col2.includes(numeroGanador)) ||
                        (apuesta === "2TO1-3" && col3.includes(numeroGanador))) ganancia += cantidad * 3;
                    else perdida += cantidad;
                }
                else perdida += cantidad;
            }

            fichasDisponibles += ganancia;
            ultimaApuesta = {};
            for (var k in fichasColocadas) ultimaApuesta[k] = fichasColocadas[k];

            if (totalApostado > 0) {
                fetch(BASE + '/api/guardar_partida.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ juego: 'ruleta', apuesta: totalApostado, ganancia, saldo: fichasDisponibles })
                }).catch(() => {});
            }

            document.querySelectorAll(".ficha").forEach(f => f.remove());
            for (const k in fichasColocadas) delete fichasColocadas[k];

            resultadoTexto.innerHTML = `<b>Número ganador:</b> ${numeroGanador} (${colorGanador})<br><small>Ganancia: ${ganancia} | Pérdidas: ${perdida}</small>`;
            actualizarInfo();
        }, 4000);
    });

    const bgMusic     = document.getElementById("bg-music");
    const toggleMusic = document.getElementById("toggle-music");
    toggleMusic.addEventListener("click", () => {
        if (bgMusic.paused) { bgMusic.play().catch(() => {});  toggleMusic.textContent = "🔊 Música"; }
        else                { bgMusic.pause(); toggleMusic.textContent = "🔇 Música"; }
    });

    const btnRepetir = document.getElementById("repetir-apuesta");
    btnRepetir.addEventListener("click", () => {
        if (Object.keys(ultimaApuesta).length === 0) { alert("No hay apuesta previa para repetir."); return; }

        document.querySelectorAll(".ficha").forEach(f => f.remove());
        for (const k in fichasColocadas) delete fichasColocadas[k];

        let totalNecesario = 0;
        for (var k in ultimaApuesta) totalNecesario += ultimaApuesta[k];
        if (fichasDisponibles < totalNecesario) { alert("No tienes suficientes fichas para repetir la apuesta."); return; }

        for (const betKey in ultimaApuesta) {
            const cantidad = ultimaApuesta[betKey];
            fichasDisponibles      -= cantidad;
            fichasColocadas[betKey] = cantidad;
            const celda = mesa.querySelector(`[data-bet="${betKey}"]`);
            if (celda) {
                const ficha = document.createElement("div");
                ficha.className   = "ficha";
                ficha.textContent = cantidad;
                celda.appendChild(ficha);
            }
        }

        actualizarInfo();
        resultadoTexto.innerHTML = `<b>Número ganador:</b> —`;
    });
};
