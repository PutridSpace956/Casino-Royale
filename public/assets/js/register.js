document.querySelector('form').addEventListener('submit', function(e) {
    const nombre    = document.getElementById('nombre').value.trim();
    const apellido  = document.getElementById('apellido').value.trim();
    const username  = document.getElementById('username').value.trim();
    const dni       = document.getElementById('dni').value.trim().toUpperCase();
    const email     = document.getElementById('email').value.trim();
    const password  = document.getElementById('password').value;
    const fecha     = document.getElementById('fecha_nacimiento').value;
    const emailRx   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dniLetras = 'TRWAGMYFPDXBNJZSQVHLCKE'; // letras del DNI español

    // calculo mod 23 para validar el DNI
    function validarDni(d) {
        if (!/^\d{8}[A-Z]$/.test(d)) return false;
        return d[8] === dniLetras[parseInt(d.slice(0, 8), 10) % 23];
    }

    if (!nombre || !apellido || !username || !dni || !email || !password || !fecha) {
        e.preventDefault();
        showError('Por favor completa todos los campos.');
    } else if (nombre.trim().split(/\s+/).length > 2) {
        e.preventDefault();
        showError('El nombre puede tener máximo 2 palabras.');
    } else if (nombre.length < 2) {
        e.preventDefault();
        showError('El nombre debe tener al menos 2 caracteres.');
    } else if (apellido.length < 2) {
        e.preventDefault();
        showError('El apellido debe tener al menos 2 caracteres.');
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        e.preventDefault();
        showError('El nombre de usuario debe tener 3-20 caracteres (letras, números y guión bajo).');
    } else if (!validarDni(dni)) {
        e.preventDefault();
        showError('El DNI no es válido (formato: 8 dígitos + letra correcta).');
    } else if (!emailRx.test(email)) {
        e.preventDefault();
        showError('El email no tiene un formato válido.');
    } else if (password.length < 6) {
        e.preventDefault();
        showError('La contraseña debe tener al menos 6 caracteres.');
    } else if (fecha) {
        const hoy        = new Date();
        const nacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m  = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        if (edad < 18) {
            e.preventDefault();
            showError('Debes tener al menos 18 años para registrarte.');
        }
    }
});

function showError(msg) {
    let el = document.querySelector('.alert.alert-error');
    if (!el) {
        el = document.createElement('div');
        el.className = 'alert alert-error';
        document.querySelector('form').before(el);
    }
    el.textContent = msg;
    el.scrollIntoView({ block: 'nearest' });
}
