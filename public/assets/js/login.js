document.querySelector('form').addEventListener('submit', function(e) {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
        e.preventDefault();
        showError('Por favor completa todos los campos.');
    } else if (!emailRx.test(email)) {
        e.preventDefault();
        showError('El email no tiene un formato válido.');
    } else if (password.length < 6) {
        e.preventDefault();
        showError('La contraseña debe tener al menos 6 caracteres.');
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
