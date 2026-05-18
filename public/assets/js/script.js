document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");
    let currentIndex = 0;
    let isAnimating = false;

    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || isAnimating) return;

        isAnimating = true;
        currentIndex = index;

        sections[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        updateBodyClass();

        setTimeout(() => { isAnimating = false; }, 500);
    }

    function updateBodyClass() {
        document.body.classList.remove("hero-active", "main-active", "footer-active");
        if (currentIndex === 0) document.body.classList.add("hero-active");
        else if (currentIndex === 1) document.body.classList.add("main-active");
        else if (currentIndex === 2) document.body.classList.add("footer-active");
    }

    window.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (isAnimating) return;
        if (e.deltaY > 0) scrollToSection(currentIndex + 1);
        else              scrollToSection(currentIndex - 1);
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); scrollToSection(currentIndex + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); scrollToSection(currentIndex - 1); }
    });

    updateBodyClass();
    setTimeout(() => scrollToSection(0), 100); // empezar siempre desde arriba
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

document.querySelector(".next").addEventListener("click", () => { nextSlide(); resetAuto(); });
document.querySelector(".prev").addEventListener("click", () => { prevSlide(); resetAuto(); });

let auto = setInterval(nextSlide, 4000);

function resetAuto() {
    clearInterval(auto);
    auto = setInterval(nextSlide, 4000);
}


(function() {
    const el = document.getElementById('ticker');
    if (!el) return; // solo existe en la página principal

    const msgs = [
        '¡Bienvenido a Royal Casino! Descubre nuestros juegos exclusivos.',
        'Juega y Gana distintos Premios en nuestros juegos de Tragaperras, Blackjack y Ruleta',
    ];
    let i = 0;

    function runNext() {
        const text     = msgs[i];
        i              = (i + 1) % msgs.length;
        el.textContent = text;

        const containerW = el.parentElement.offsetWidth;
        const textW      = el.offsetWidth;
        const duration   = (containerW + textW) / 120; // 120px por segundo

        el.style.transition = 'none';
        el.style.transform  = 'translateX(' + containerW + 'px)';

        // esperar 20ms para que el navegador aplique la posición inicial antes de animar
        setTimeout(() => {
            el.style.transition = 'transform ' + duration + 's linear';
            el.style.transform  = 'translateX(-' + textW + 'px)';
        }, 20);

        setTimeout(runNext, (duration + 1) * 1000);
    }

    runNext();
})();
