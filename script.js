// =====================================================
// PERFUMERÍA ESSENCE - JAVASCRIPT
// =====================================================
// Este archivo está dividido en 3 secciones:
// DÍA 1: Login y autenticación
// DÍA 2: Mostrar perfumes en catálogo
// DÍA 3: Favoritos y filtros
// =====================================================

// ========== VARIABLES GLOBALES ==========
let perfumes = [];
let usuarios = [];
let usuarioActual = null;

// ========== INICIALIZACIÓN ==========
// Esta función se ejecuta cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada');
    cargarDatos();
    iniciarAplicacion();
});

// ========== CARGAR DATOS DESDE JSON ==========
function cargarDatos() {
    // Cargar perfumes desde el JSON
    fetch('bd/perfume.json')
        .then(response => response.json())
        .then(data => {
            perfumes = data.perfumes;
            console.log('Perfumes cargados:', perfumes.length);
        })
        .catch(error => {
            console.error('Error cargando perfumes:', error);
        });

    // Cargar usuarios desde el JSON
    fetch('bd/usuarios.json')
        .then(response => response.json())
        .then(data => {
            usuarios = data.usuarios;
            console.log('Usuarios cargados:', usuarios.length);
        })
        .catch(error => {
            console.error('Error cargando usuarios:', error);
        });
}

// ========== DETECTAR EN QUÉ PÁGINA ESTAMOS ==========
function iniciarAplicacion() {
    // Obtener el nombre del archivo actual
    const paginaActual = window.location.pathname.split('/').pop();
    
    console.log('Página actual:', paginaActual);

    // Si estamos en login.html
    if (paginaActual === 'login.html' || paginaActual === '') {
        configurarLogin();
    } 
    // Si estamos en cualquier otra página
    else {
        verificarSesion();
        configurarPagina();
    }
}


// =====================================================
// ========== DÍA 1: SISTEMA DE LOGIN ==========
// =====================================================

// Configurar la página de login
function configurarLogin() {
    console.log('Configurando página de login');
    
    // Buscar el formulario de login
    const formulario = document.getElementById('loginForm');
    
    if (formulario) {
        // Cuando se envíe el formulario
        formulario.addEventListener('submit', function(evento) {
            evento.preventDefault(); // Evitar que recargue la página
            
            // Obtener los valores del formulario
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            
            console.log('Intentando login con:', email);
            
            // Intentar hacer login
            hacerLogin(email, password);
        });
    }
}

// Función para hacer login
function hacerLogin(email, password) {
    // Buscar el usuario en el array
    const usuarioEncontrado = usuarios.find(function(usuario) {
        return usuario.email === email && usuario.password === password;
    });

    // Si encontramos el usuario
    if (usuarioEncontrado) {
        console.log('Login exitoso:', usuarioEncontrado.nombre);
        
        // Guardar usuario en localStorage
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioEncontrado));
        
        // Redirigir al catálogo
        window.location.href = 'vistas/index.html';
    } 
    // Si no encontramos el usuario
    else {
        console.log('Credenciales incorrectas');
        
        // Mostrar mensaje de error
        const mensajeError = document.getElementById('errorMessage');
        mensajeError.textContent = 'Email o contraseña incorrectos';
        mensajeError.style.display = 'block';
    }
}

// Verificar si hay una sesión activa
function verificarSesion() {
    // Obtener usuario de localStorage
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    
    if (usuarioGuardado) {
        // Si hay usuario guardado, parsearlo
        usuarioActual = JSON.parse(usuarioGuardado);
        console.log('Sesión activa:', usuarioActual.nombre);
    } else {
        // Si no hay sesión, redirigir al login
        console.log('No hay sesión activa, redirigiendo a login');
        window.location.href = '../login.html';
    }
}

// Cerrar sesión
function cerrarSesion() {
    console.log('Cerrando sesión');
    
    // Borrar usuario de localStorage
    localStorage.removeItem('usuarioActual');
    
    // Redirigir al login
    window.location.href = '../login.html';
}



