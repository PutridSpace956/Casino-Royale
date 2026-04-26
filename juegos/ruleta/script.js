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

window.onload = function () {
  let fichasDisponibles = getFichas();
  let apuestaActual = 1;
  const fichasColocadas = {};
  let ultimaApuesta = {};
  
  let mousePresionado = false;
  let ultimaCeldaApuesta = null;
  let timerClickSostenido = null;

  const spanFichas = document.getElementById("fichas-disponibles");
  const spanApuesta = document.getElementById("apuesta-actual");
  const barraApuesta = document.getElementById("barra-apuesta");
  const btnEliminar = document.getElementById("eliminar-fichas");
  const resultadoTexto = document.getElementById("resultado-ruleta");
  const ruletaImg = document.getElementById("ruleta");
  const btnGirar = document.getElementById("girar-ruleta");
  const sonidoBola = document.getElementById("ball-sound");
  const mesa = document.getElementById("mesa");

  const colores = {
    0: "green",
    1: "red", 2: "black", 3: "red", 4: "black", 5: "red", 6: "black",
    7: "red", 8: "black", 9: "red", 10: "black", 11: "red", 12: "black",
    13: "red", 14: "black", 15: "red", 16: "black", 17: "red", 18: "black",
    19: "red", 20: "black", 21: "red", 22: "black", 23: "red", 24: "black",
    25: "red", 26: "black", 27: "red", 28: "black", 29: "red", 30: "black",
    31: "red", 32: "black", 33: "red", 34: "black", 35: "red", 36: "black"
  };
  

  function inicializarColores() {
    const celdas = mesa.querySelectorAll("td");
    celdas.forEach(td => {
      const bet = td.getAttribute("data-bet");
      if (bet && !isNaN(bet)) {
        const num = parseInt(bet, 10);
        td.style.background = colores[num] || "rgba(0,0,0,0.25)";
      } else if (!td.classList.contains("vacio")) {
        td.style.background = "rgba(0,0,0,0.25)";
      }
    });
  }
  inicializarColores();

  barraApuesta.max = fichasDisponibles;

  function actualizarInfo() {
    barraApuesta.max = fichasDisponibles;

    if (apuestaActual > fichasDisponibles) {
      apuestaActual = fichasDisponibles > 0 ? fichasDisponibles : 1;
      barraApuesta.value = apuestaActual;
    }

    spanFichas.textContent = fichasDisponibles;
    spanApuesta.textContent = apuestaActual;
    setFichas(fichasDisponibles);
  }
  actualizarInfo();

  barraApuesta.addEventListener("input", () => {
    apuestaActual = parseInt(barraApuesta.value, 10);
    actualizarInfo();
  });

  btnEliminar.addEventListener("click", () => {
    for (const key in fichasColocadas) fichasDisponibles += fichasColocadas[key];
    document.querySelectorAll(".ficha").forEach(f => f.remove());
    for (const k in Object.assign({}, fichasColocadas)) delete fichasColocadas[k];
    actualizarInfo();
    resultadoTexto.innerHTML = `<b>Número ganador:</b> —`;
  });

  // ✅ Función para colocar una ficha
  function colocarFichaEnCelda(celda) {
    if (!celda || celda.classList.contains("vacio")) return;
    
    const betKey = celda.getAttribute("data-bet") || celda.textContent.trim();
    if (!betKey) return;

    if (fichasDisponibles < apuestaActual) {
      alert("No tienes suficientes fichas");
      return;
    }

    fichasDisponibles -= apuestaActual;
    setFichas(fichasDisponibles);
    fichasColocadas[betKey] = (fichasColocadas[betKey] || 0) + apuestaActual;

    let ficha = celda.querySelector(".ficha");
    if (!ficha) {
      ficha = document.createElement("div");
      ficha.className = "ficha";
      celda.appendChild(ficha);
    }
    ficha.textContent = fichasColocadas[betKey];
    actualizarInfo();
  }

  // ✅ SOLO usar mousedown para colocar fichas - ELIMINAR el evento click
  mesa.addEventListener("mousedown", (e) => {
    // Prevenir selección de texto
    e.preventDefault();
    
    const celda = e.target.closest("td");
    if (!celda || celda.classList.contains("vacio")) return;
    
    mousePresionado = true;
    ultimaCeldaApuesta = celda;
    
    // Colocar primera ficha inmediatamente
    colocarFichaEnCelda(celda);
    
    // Timer para colocar fichas repetidas
    timerClickSostenido = setTimeout(() => {
      if (mousePresionado && ultimaCeldaApuesta === celda) {
        const intervaloRepeticion = setInterval(() => {
          if (!mousePresionado || ultimaCeldaApuesta !== celda) {
            clearInterval(intervaloRepeticion);
            return;
          }
          colocarFichaEnCelda(celda);
        }, 300);
        
        celda.dataset.intervaloRepeticion = intervaloRepeticion;
      }
    }, 300); // 300ms para comenzar repetición
  });

  mesa.addEventListener("mouseup", () => {
    mousePresionado = false;
    ultimaCeldaApuesta = null;
    clearTimeout(timerClickSostenido);
    
    document.querySelectorAll("td").forEach(td => {
      if (td.dataset.intervaloRepeticion) {
        clearInterval(parseInt(td.dataset.intervaloRepeticion));
        delete td.dataset.intervaloRepeticion;
      }
    });
  });

  mesa.addEventListener("mouseleave", () => {
    mousePresionado = false;
    ultimaCeldaApuesta = null;
    clearTimeout(timerClickSostenido);
  });

  mesa.addEventListener("mousemove", (e) => {
    if (!mousePresionado) return;
    
    const celda = e.target.closest("td");
    if (!celda || celda === ultimaCeldaApuesta || celda.classList.contains("vacio")) return;
    
    ultimaCeldaApuesta = celda;
    colocarFichaEnCelda(celda);
  });

  // ✅ Soporte para pantallas táctiles
  let touchActivo = false;
  
  mesa.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const celda = document.elementFromPoint(touch.clientX, touch.clientY).closest("td");
    if (!celda) return;
    
    touchActivo = true;
    ultimaCeldaApuesta = celda;
    
    colocarFichaEnCelda(celda);
    
    // Timer para repetición en touch
    timerClickSostenido = setTimeout(() => {
      if (touchActivo && ultimaCeldaApuesta === celda) {
        const intervaloRepeticion = setInterval(() => {
          if (!touchActivo || ultimaCeldaApuesta !== celda) {
            clearInterval(intervaloRepeticion);
            return;
          }
          colocarFichaEnCelda(celda);
        }, 300);
        
        celda.dataset.intervaloRepeticion = intervaloRepeticion;
      }
    }, 300);
  });

  mesa.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!touchActivo) return;
    
    const touch = e.touches[0];
    const celda = document.elementFromPoint(touch.clientX, touch.clientY).closest("td");
    if (!celda || celda === ultimaCeldaApuesta || celda.classList.contains("vacio")) return;
    
    ultimaCeldaApuesta = celda;
    colocarFichaEnCelda(celda);
  });

  mesa.addEventListener("touchend", () => {
    touchActivo = false;
    ultimaCeldaApuesta = null;
    clearTimeout(timerClickSostenido);
    
    document.querySelectorAll("td").forEach(td => {
      if (td.dataset.intervaloRepeticion) {
        clearInterval(parseInt(td.dataset.intervaloRepeticion));
        delete td.dataset.intervaloRepeticion;
      }
    });
  });

  // ✅ PREVENIR el evento click para que no duplique fichas
  mesa.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  let anguloActual = 0;
  let girando = false;

  btnGirar.addEventListener("click", () => {
    if (girando) return;
    girando = true;

    sonidoBola.currentTime = 0;
    sonidoBola.play();

    const rotacion = 1440 + Math.floor(Math.random() * 360);
    anguloActual += rotacion;
    ruletaImg.style.transform = `rotate(${anguloActual}deg)`;

    setTimeout(() => {
      sonidoBola.pause();
      girando = false;

      const numeroGanador = Math.floor(Math.random() * 37);
      const colorGanador = colores[numeroGanador];

      let ganancia = 0;
      let perdida = 0;

      for (const apuesta in fichasColocadas) {
        const cantidad = fichasColocadas[apuesta];

        if (!isNaN(apuesta)) {
          if (parseInt(apuesta, 10) === numeroGanador) ganancia += cantidad * 35;
          else perdida += cantidad;
        }
        else if (apuesta === "RED" || apuesta === "BLACK") {
          if ((apuesta === "RED" && colorGanador === "red") ||
              (apuesta === "BLACK" && colorGanador === "black")) ganancia += cantidad * 2;
          else perdida += cantidad;
        }
        else if (apuesta === "EVEN" || apuesta === "ODD") {
          if (numeroGanador !== 0) {
            if ((apuesta === "EVEN" && numeroGanador % 2 === 0) ||
                (apuesta === "ODD" && numeroGanador % 2 === 1)) ganancia += cantidad * 2;
            else perdida += cantidad;
          } else perdida += cantidad;
        }
        else if (apuesta === "1-18" || apuesta === "19-36") {
          if ((apuesta === "1-18" && numeroGanador >=1 && numeroGanador <=18) ||
              (apuesta === "19-36" && numeroGanador >=19 && numeroGanador <=36)) ganancia += cantidad * 2;
          else perdida += cantidad;
        }
        else if (apuesta === "1ST-12" || apuesta === "2ND-12" || apuesta === "3RD-12") {
          if ((apuesta === "1ST-12" && numeroGanador >=1 && numeroGanador <=12) ||
              (apuesta === "2ND-12" && numeroGanador >=13 && numeroGanador <=24) ||
              (apuesta === "3RD-12" && numeroGanador >=25 && numeroGanador <=36)) ganancia += cantidad * 3;
          else perdida += cantidad;
        }
        else if (apuesta.startsWith("2TO1")) {
          const col1 = [1,4,7,10,13,16,19,22,25,28,31,34];
          const col2 = [2,5,8,11,14,17,20,23,26,29,32,35];
          const col3 = [3,6,9,12,15,18,21,24,27,30,33,36];
          if (
            (apuesta === "2TO1-1" && col1.includes(numeroGanador)) ||
            (apuesta === "2TO1-2" && col2.includes(numeroGanador)) ||
            (apuesta === "2TO1-3" && col3.includes(numeroGanador))
          ) {
            ganancia += cantidad * 3;
          } else perdida += cantidad;
        }
        else perdida += cantidad;
      }

      fichasDisponibles += ganancia;
      setFichas(fichasDisponibles);
      ultimaApuesta = { ...fichasColocadas };

      document.querySelectorAll(".ficha").forEach(f => f.remove());
      for (const k in fichasColocadas) delete fichasColocadas[k];

      resultadoTexto.innerHTML = `<b>Número ganador:</b> ${numeroGanador} (${colorGanador})<br><small>Ganancia: ${ganancia} | Pérdidas: ${perdida}</small>`;
      actualizarInfo();
    }, 4000);
  });

  const bgMusic = document.getElementById("bg-music");
  const toggleMusic = document.getElementById("toggle-music");
  toggleMusic.addEventListener("click", () => {
    if (bgMusic.paused) { bgMusic.play(); toggleMusic.textContent = "🔊 Música (ON)"; }
    else { bgMusic.pause(); toggleMusic.textContent = "🔇 Música"; }
  });

  const btnRepetir = document.getElementById("repetir-apuesta");
  btnRepetir.addEventListener("click", () => {
    if (Object.keys(ultimaApuesta).length === 0) {
      alert("No hay apuesta previa para repetir.");
      return;
    }

    document.querySelectorAll(".ficha").forEach(f => f.remove());
    for (const k in fichasColocadas) delete fichasColocadas[k];

    let totalNecesario = 0;
    for (const key in ultimaApuesta) totalNecesario += ultimaApuesta[key];

    if (fichasDisponibles < totalNecesario) {
      alert("No tienes suficientes fichas para repetir la apuesta.");
      return;
    }

    for (const betKey in ultimaApuesta) {
      const cantidad = ultimaApuesta[betKey];
      fichasDisponibles -= cantidad;
      fichasColocadas[betKey] = cantidad;

      const celda = mesa.querySelector(`[data-bet="${betKey}"]`);
      if (celda) {
        let ficha = document.createElement("div");
        ficha.className = "ficha";
        ficha.textContent = cantidad;
        celda.appendChild(ficha);
      }
    }

    actualizarInfo();
    resultadoTexto.innerHTML = `<b>Número ganador:</b> —`;
  });

  // ✅ Listener de storage movido dentro de window.onload
  window.addEventListener("storage", () => {
    fichasDisponibles = getFichas();
    actualizarInfo();
  });
};