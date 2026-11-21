// Elementos comunes a todas las páginas: menú, protección de páginas y mensajes.
import { obtenerSesion, cerrarSesion } from '../services/authService.js';
import { puedeAcceder, paginaInicio, MENSAJES } from '../logic/auth.js';

// Opciones del menú y qué roles las ven (null = todos, incluso sin sesión).
const OPCIONES_MENU = [
  { texto: 'Inicio', href: 'index.html', roles: null },
  { texto: 'Panel', href: 'panel.html', roles: ['serenazgo', 'admin'] },
  { texto: 'Mi perfil', href: 'perfil.html', roles: ['vecino', 'serenazgo', 'admin'] },
];

export function pintarMenu() {
  const nav = document.getElementById('menu');
  if (!nav) return;
  const sesion = obtenerSesion();
  const actual = location.pathname.split('/').pop() || 'index.html';

  const enlaces = OPCIONES_MENU.filter((op) => op.roles === null || (sesion && op.roles.includes(sesion.rol)))
    .map((op) => `<a href="${op.href}" class="${op.href === actual ? 'activo' : ''}">${op.texto}</a>`)
    .join('');

  const cuenta = sesion
    ? `<span class="usuario">${escaparHtml(sesion.nombre)} (${sesion.rol})</span>
       <button id="btn-salir" class="btn btn-secundario">Cerrar sesión</button>`
    : `<a href="login.html" class="btn">Iniciar sesión</a>
       <a href="registro.html" class="btn btn-secundario">Registrarse</a>`;

  nav.innerHTML = `<div class="enlaces">${enlaces}</div><div class="cuenta">${cuenta}</div>`;

  // HU03: cerrar sesión
  document.getElementById('btn-salir')?.addEventListener('click', () => {
    cerrarSesion();
    location.href = 'login.html';
  });
}

// HU03 y HU04: si no hay sesión va al login; si el rol no tiene permiso, va a su inicio.
export function protegerPagina(pagina) {
  const sesion = obtenerSesion();
  if (!sesion) {
    location.replace('login.html');
    return null;
  }
  if (!puedeAcceder(sesion.rol, pagina)) {
    location.replace(`${paginaInicio(sesion.rol)}?error=no-autorizado`);
    return null;
  }
  return sesion;
}

// Muestra "Acceso no autorizado" cuando se llega redirigido por HU04.
export function mostrarErrorDeAcceso(contenedor) {
  if (new URLSearchParams(location.search).get('error') === 'no-autorizado') {
    mostrarMensaje(contenedor, MENSAJES.NO_AUTORIZADO, 'error');
  }
}

export function mostrarMensaje(contenedor, texto, tipo = 'exito') {
  if (!contenedor) return;
  contenedor.textContent = texto;
  contenedor.className = `mensaje ${tipo}`;
  contenedor.hidden = false;
}

// Muestra los errores de validación debajo de cada campo y lo marca en rojo.
export function mostrarErroresDeCampos(formulario, errores) {
  formulario.querySelectorAll('.error-campo').forEach((el) => (el.textContent = ''));
  formulario.querySelectorAll('.invalido').forEach((el) => el.classList.remove('invalido'));
  Object.entries(errores).forEach(([campo, texto]) => {
    const input = formulario.elements[campo];
    input?.classList.add('invalido');
    const salida = formulario.querySelector(`[data-error="${campo}"]`);
    if (salida) salida.textContent = texto;
  });
}

// Evita inyectar HTML con datos escritos por usuarios (protección contra XSS).
export function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
