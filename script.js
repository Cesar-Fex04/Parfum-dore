//  variables globales
let perfumes = [];
let usuarios = [];
let usuarioActual = null;

// Detectamos si estamos dentro de la carpeta 'vistas' para ajustar rutas relativas
const esVistas = window.location.pathname.includes('/vistas/');

// iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    iniciarAplicacion();
});

// cargar datos desde los archivos JSON
function cargarDatos() {
    
    const rutaBase = esVistas ? '../bd/' : 'bd/';

    fetch(rutaBase + 'perfume.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            perfumes = data.perfumes;
            if (esVistas) mostrarPerfumesSegunPagina();
        })
        .catch(() => console.log('Esperando carga de perfumes o error en ruta...'));

    fetch(rutaBase + 'usuarios.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => usuarios = data.usuarios)
        .catch(() => console.log('Cargando usuarios...'));
}

// navegacion
function iniciarAplicacion() {
    const pagina = window.location.pathname.split('/').pop();

    if (!esVistas) {
        configurarLogin();
    } else {
        verificarSesion();
        configurarPagina(pagina);
    }
}

//Login
function configurarLogin() {
    // Si el usuario ya tiene sesión, lo mandamos directo adentro
    if (localStorage.getItem('usuarioActual')) {
        window.location.href = 'vistas/home.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            const pass = document.getElementById('passwordInput').value;
            hacerLogin(email, pass);
        });
    }
}

function hacerLogin(email, password) {
    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (usuario) {
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        window.location.href = 'vistas/home.html';
    } else {
        const msg = document.getElementById('errorMessage');
        if (msg) {
            msg.textContent = 'Email o contraseña incorrectos';
            msg.style.display = 'block';
        }
    }
}

// Sesion
function verificarSesion() {
    const guardado = localStorage.getItem('usuarioActual');
    if (guardado) {
        usuarioActual = JSON.parse(guardado);
    } else {
        // Si no hay sesión, sacar al usuario a la raíz (../index.html)
        window.location.href = '../index.html';
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    // Redirigir al Login en la raíz
    window.location.href = '../index.html';
}

// configurar vistas
function configurarPagina(pagina) {
    const btnSalir = document.getElementById('btnCerrarSesion');
    if (btnSalir) btnSalir.addEventListener('click', cerrarSesion);

    if (pagina === 'populares.html') {
        const select = document.getElementById('selectOrden');
        if (select) select.addEventListener('change', mostrarPopulares);
    }
}

// Renderizar productos segun la pagina
function mostrarPerfumesSegunPagina() {
    const pagina = window.location.pathname.split('/').pop();
    
    
    if (pagina === 'home.html') mostrarCatalogo();
    else if (pagina === 'populares.html') mostrarPopulares();
    else if (pagina === 'favoritos.html') mostrarFavoritos();
}

function mostrarCatalogo() {
    renderizarGrid('catalogoGrid', perfumes);
}

function mostrarPopulares() {
    const select = document.getElementById('selectOrden');
    const criterio = select ? select.value : 'popularidad-desc';
    let ordenados = [...perfumes];

    if (criterio === 'popularidad-desc') ordenados.sort((a, b) => b.popularidad - a.popularidad);
    if (criterio === 'popularidad-asc') ordenados.sort((a, b) => a.popularidad - b.popularidad);
    if (criterio === 'precio-asc') ordenados.sort((a, b) => a.precio - b.precio);
    if (criterio === 'precio-desc') ordenados.sort((a, b) => b.precio - a.precio);

    renderizarGrid('popularesGrid', ordenados);
}

function mostrarFavoritos() {
    const favoritosIds = obtenerFavoritosIds();
    const listaFavoritos = perfumes.filter(p => favoritosIds.includes(p.id));
    
    renderizarGrid('favoritosGrid', listaFavoritos);
    
    const msgVacio = document.getElementById('mensajeVacio');
    if (msgVacio) msgVacio.style.display = listaFavoritos.length === 0 ? 'block' : 'none';
}

//Productos en Cards   
function renderizarGrid(idGrid, listaPerfumes) {
    const grid = document.getElementById(idGrid);
    if (!grid) return;

    grid.innerHTML = '';
    listaPerfumes.forEach(p => grid.appendChild(crearCard(p)));
}

function crearCard(perfume) {
    const article = document.createElement('article');
    article.className = 'perfume-card';
    const esFav = esFavorito(perfume.id);
    
    article.innerHTML = `
        <img src="${perfume.imagen}" alt="${perfume.nombre}" class="perfume-img">
        <div class="perfume-info">
            <p class="perfume-marca">${perfume.marca}</p>
            <h3 class="perfume-nombre">${perfume.nombre}</h3>
            <p class="perfume-descripcion">${perfume.descripcion}</p>
            <div class="perfume-detalles">
                <span class="perfume-precio">$${perfume.precio.toFixed(2)}</span>
                <span class="perfume-popularidad">⭐ ${perfume.popularidad}</span>
            </div>
            <button class="btn-favorito ${esFav ? 'activo' : ''}" data-id="${perfume.id}">
                ${esFav ? '❤️ En Favoritos' : '🤍 Agregar a Favoritos'}
            </button>
        </div>
    `;

    article.querySelector('.btn-favorito').addEventListener('click', () => toggleFavorito(perfume.id));
    return article;
}

// Gestion de Favoritos
function obtenerFavoritosIds() {
    if (!usuarioActual) return [];
    const data = localStorage.getItem('favoritos_usuario_' + usuarioActual.id);
    return data ? JSON.parse(data) : [];
}

function esFavorito(id) {
    return obtenerFavoritosIds().includes(id);
}

function toggleFavorito(id) {
    if (!usuarioActual) return alert('Inicia sesión para guardar favoritos');

    let favoritos = obtenerFavoritosIds();
    const index = favoritos.indexOf(id);
    let mensaje = '';

    if (index > -1) {
        favoritos.splice(index, 1);
        mensaje = 'Eliminado de favoritos';
    } else {
        favoritos.push(id);
        mensaje = 'Agregado a favoritos';
    }

    localStorage.setItem('favoritos_usuario_' + usuarioActual.id, JSON.stringify(favoritos));
    mostrarNotificacion(mensaje);
    
    // Recargamos la vista para actualizar los corazones
    mostrarPerfumesSegunPagina(); 
}

// Notificaciones
function mostrarNotificacion(texto) {
    const notif = document.createElement('div');
    notif.className = 'notificacion';
    notif.textContent = texto;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}