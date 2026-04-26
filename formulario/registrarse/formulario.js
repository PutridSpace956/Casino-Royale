document.addEventListener('DOMContentLoaded', function() {
  const formulario = document.getElementById('formulario-casino');
  const checkboxTerminos = document.getElementById('terminos');
  
  const regexSoloLetras = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
  const regexDNI = /^[0-9]{8}[A-Za-z]$/;
  
  function validarNombreApellidos(valor, campo) {
    if (!valor.trim()) {
      return `El ${campo} es obligatorio`;
    }
    
    if (!regexSoloLetras.test(valor)) {
      return `El ${campo} solo puede contener letras y espacios`;
    }
    
    if (valor.length < 2) {
      return `El ${campo} debe tener al menos 2 caracteres`;
    }
    
    if (valor.length > 50) {
      return `El ${campo} no puede exceder 50 caracteres`;
    }
    
    return '';
  }

  function validarDNI(dni) {
    if (!dni.trim()) {
      return 'El DNI es obligatorio';
    }

    dni = dni.toUpperCase();

    if (!regexDNI.test(dni)) {
      return 'Formato de DNI inválido (8 números + 1 letra)';
    }

    const numero = dni.substring(0, 8);
    const letra = dni.substring(8, 9);
    const letrasValidas = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const letraCalculada = letrasValidas[numero % 23];
    
    if (letra !== letraCalculada) {
      return 'La letra del DNI no es correcta';
    }
    
    return '';
  }

  function mostrarError(inputId, mensaje) {
    const errorElement = document.getElementById(`error-${inputId}`);
    const inputElement = document.getElementById(inputId);
    
    if (mensaje) {
      errorElement.textContent = mensaje;
      errorElement.style.display = 'block';
      inputElement.classList.add('input-error');
      inputElement.classList.remove('input-valido');
    } else {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
      inputElement.classList.remove('input-error');
      inputElement.classList.add('input-valido');
    }
  }

  function limpiarErrores() {
    const errores = document.querySelectorAll('.mensaje-error');
    const inputs = document.querySelectorAll('.grupo-form input, .grupo-form select');
    
    errores.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });
    
    inputs.forEach(input => {
      input.classList.remove('input-error', 'input-valido');
    });

    const errorTerminos = document.getElementById('error-terminos');
    if (errorTerminos) {
      errorTerminos.textContent = '';
      errorTerminos.style.display = 'none';
    }
  }
  
  formulario.addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const primerApellido = document.getElementById('primer-apellido').value;
    const segundoApellido = document.getElementById('segundo-apellido').value;
    const dni = document.getElementById('dni').value;

    limpiarErrores();

    const errores = [];

    const errorNombre = validarNombreApellidos(nombre, 'nombre');
    if (errorNombre) {
      mostrarError('nombre', errorNombre);
      errores.push('nombre');
    }

    const errorPrimerApellido = validarNombreApellidos(primerApellido, 'primer apellido');
    if (errorPrimerApellido) {
      mostrarError('primer-apellido', errorPrimerApellido);
      errores.push('primer-apellido');
    }
    
    if (segundoApellido.trim()) {
      const errorSegundoApellido = validarNombreApellidos(segundoApellido, 'segundo apellido');
      if (errorSegundoApellido) {
        mostrarError('segundo-apellido', errorSegundoApellido);
        errores.push('segundo-apellido');
      }
    }

    const errorDNI = validarDNI(dni);
    if (errorDNI) {
      mostrarError('dni', errorDNI);
      errores.push('dni');
    } else {

      document.getElementById('dni').value = dni.toUpperCase();
    }

    if (!checkboxTerminos.checked) {
      const errorTerminos = document.getElementById('error-terminos');
      errorTerminos.textContent = 'Debes aceptar los términos y condiciones';
      errorTerminos.style.display = 'block';
      errores.push('terminos');
    }
    
    if (errores.length === 0) {
      alert('¡Formulario enviado correctamente!');
      
      console.log('Datos válidos:', {
        nombre,
        primerApellido,
        segundoApellido: segundoApellido || '(vacío)',
        dni: dni.toUpperCase()
      });
      
    } else {
      if (errores.length > 0 && errores[0] !== 'terminos') {
        document.getElementById(errores[0]).focus();
      }
    }
  });

  const inputs = document.querySelectorAll('#nombre, #primer-apellido, #segundo-apellido, #dni');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('input-error');
      const errorId = `error-${this.id}`;
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    });
  });

  checkboxTerminos.addEventListener('change', function() {
    const errorTerminos = document.getElementById('error-terminos');
    if (errorTerminos) {
      errorTerminos.style.display = 'none';
    }
  });
});

function abrirTerminosPopup() {
    const width = 900;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
        'terminos.html',
        'TerminosYCondiciones',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
    );
    
    // Enfocar el popup
    if (popup) {
        popup.focus();
    }
    
    return false; // Para prevenir el comportamiento normal del enlace
}

// Añadir el evento al enlace
document.addEventListener('DOMContentLoaded', function() {
    const enlaceTerminos = document.getElementById('ver-terminos');
    if (enlaceTerminos) {
        enlaceTerminos.addEventListener('click', function(e) {
            e.preventDefault();
            abrirTerminosPopup();
        });
    }
    
    // ... el resto de tu código de validación ...
    
    // Función para mostrar notificación (si la usas)
    window.mostrarNotificacion = function(mensaje) {
        alert(mensaje);
    };
});