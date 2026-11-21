import { pintarMenu, mostrarErrorDeAcceso } from './layout.js';
import { obtenerSesion } from '../services/authService.js';

pintarMenu();
mostrarErrorDeAcceso(document.getElementById('mensaje'));

const sesion = obtenerSesion();
const saludo = document.getElementById('saludo');
if (sesion && saludo) {
  saludo.textContent = `Hola, ${sesion.nombre}. Gracias por ayudar a que SJL sea más seguro.`;
  document.getElementById('acciones-invitado').hidden = true;
}
