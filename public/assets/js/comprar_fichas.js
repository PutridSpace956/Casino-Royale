let selectedPaquete = null;

document.querySelectorAll('.paquete').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.paquete').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
        selectedPaquete = {
            fichas: parseInt(el.dataset.fichas),
            precio: parseFloat(el.dataset.precio)
        };
    });
    if (el.classList.contains('selected')) {
        selectedPaquete = {
            fichas: parseInt(el.dataset.fichas),
            precio: parseFloat(el.dataset.precio)
        };
    }
});

// separar el número de tarjeta en grupos de 4
document.getElementById('numero').addEventListener('input', function () {
    let raw = this.value.replace(/\D/g, '').slice(0, 16);
    let grupos = raw.match(/.{1,4}/g);
    this.value = grupos ? grupos.join(' ') : raw;
});

document.getElementById('caducidad').addEventListener('input', function () {
    let raw = this.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    this.value = raw;
});

document.getElementById('cvv').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
});

function showAlert(msg, type) {
    const el = document.getElementById('alerta');
    el.textContent = msg;
    el.className   = 'alerta ' + type;
}

function hideAlert() {
    document.getElementById('alerta').className = 'alerta oculto';
}

document.getElementById('form-compra').addEventListener('submit', function(e) {
    e.preventDefault();
    hideAlert();

    if (!selectedPaquete) {
        showAlert('Selecciona un paquete de fichas.', 'error');
        return;
    }

    const titular   = document.getElementById('titular').value.trim();
    const numero    = document.getElementById('numero').value.trim();
    const caducidad = document.getElementById('caducidad').value.trim();
    const cvv       = document.getElementById('cvv').value.trim();

    if (!titular) {
        showAlert('Introduce el nombre del titular.', 'error');
        return;
    }

    const rawNum = numero.replace(/\s/g, '');
    if (rawNum.length !== 16 || !/^\d+$/.test(rawNum)) {
        showAlert('El número de tarjeta debe tener 16 dígitos.', 'error');
        return;
    }

    const expParts = caducidad.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
        showAlert('Introduce la caducidad en formato MM/AA.', 'error');
        return;
    }
    const mm = parseInt(expParts[0]);
    const yy = parseInt(expParts[1]) + 2000;
    const now = new Date();
    const expDate = new Date(yy, mm, 1);
    if (mm < 1 || mm > 12 || expDate <= now) {
        showAlert('La tarjeta está caducada o la fecha no es válida.', 'error');
        return;
    }

    if (cvv.length < 3) {
        showAlert('El CVV debe tener al menos 3 dígitos.', 'error');
        return;
    }

    const btn = document.getElementById('btn-comprar');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    fetch(BASE + '/api/comprar_fichas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fichas: selectedPaquete.fichas,
            precio: selectedPaquete.precio
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.ok) {
            showAlert('¡Compra realizada! Se han añadido ' + selectedPaquete.fichas + ' fichas a tu cuenta.', 'ok');
            btn.textContent = 'Compra completada';
        } else {
            showAlert(data.error || 'Error al procesar la compra.', 'error');
            btn.disabled = false;
            btn.textContent = 'Comprar fichas';
        }
    })
    .catch(function() {
        showAlert('Error de conexión. Inténtalo de nuevo.', 'error');
        btn.disabled = false;
        btn.textContent = 'Comprar fichas';
    });
});
