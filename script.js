document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");
    let currentIndex = 0;
    let isAnimating = false;

    // Función principal de movimiento
    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || isAnimating) return;
        
        isAnimating = true;
        currentIndex = index;

        // Desplaza suavemente hacia la sección
        sections[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        updateBodyClass();

        // Bloqueamos nuevos scrolls hasta que termine la animación (aprox 800ms)
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function updateBodyClass() {
        document.body.classList.remove("hero-active", "main-active", "footer-active");
        if (currentIndex === 0) document.body.classList.add("hero-active");
        else if (currentIndex === 1) document.body.classList.add("main-active");
        else if (currentIndex === 2) document.body.classList.add("footer-active");
    }

    // Control Rueda del Ratón (Wheel)
    window.addEventListener("wheel", (e) => {
        // Prevenir el comportamiento por defecto
        e.preventDefault(); 
        
        if (isAnimating) return;

        if (e.deltaY > 0) {
            // Bajar
            scrollToSection(currentIndex + 1);
        } else {
            // Subir
            scrollToSection(currentIndex - 1);
        }
    }, { passive: false }); // 'passive: false' permite usar preventDefault

    // Control Teclado (Flechas)
    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault(); // Evita scroll nativo
            scrollToSection(currentIndex + 1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            scrollToSection(currentIndex - 1);
        }
    });

    // Inicializar
    updateBodyClass();
    // Asegurar que al recargar empiece arriba o donde estaba
    setTimeout(() => scrollToSection(0), 100);
});

const slides = document.querySelectorAll(".slide");
let index = 0;

function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

function nextSlide() {
  index = (index + 1) % slides.length;
  showSlide(index);
}

function prevSlide() {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
}

document.querySelector(".next").addEventListener("click", () => {
  nextSlide();
  resetAuto();
});

document.querySelector(".prev").addEventListener("click", () => {
  prevSlide();
  resetAuto();
});

let auto = setInterval(nextSlide, 4000);

function resetAuto() {
  clearInterval(auto);
  auto = setInterval(nextSlide, 4000);
}


