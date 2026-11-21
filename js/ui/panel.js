// HU04: solo serenazgo y administrador pueden ver el panel.
// La gestión de reportes (HU14 y HU15) se implementa en el Sprint 4.
import { pintarMenu, protegerPagina, mostrarErrorDeAcceso } from './layout.js';

const sesion = protegerPagina('panel');

if (sesion) {
  pintarMenu();
  mostrarErrorDeAcceso(document.getElementById('mensaje'));
  document.getElementById('bienvenida').textContent = `Bienvenido(a), ${sesion.nombre}.`;
}
