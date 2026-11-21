// HU01: iniciar sesión según rol
import { pintarMenu, mostrarMensaje } from './layout.js';
import { iniciarSesion, obtenerSesion } from '../services/authService.js';
import { paginaInicio, MENSAJES } from '../logic/auth.js';

const sesion = obtenerSesion();
if (sesion) location.replace(paginaInicio(sesion.rol));

pintarMenu();

const formulario = document.getElementById('form-login');
const mensaje = document.getElementById('mensaje');

if (new URLSearchParams(location.search).get('registro') === 'ok') {
  mostrarMensaje(mensaje, 'Cuenta creada. Ya puedes iniciar sesión.', 'exito');
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const usuario = await iniciarSesion(formulario.email.value, formulario.password.value);
  if (usuario) {
    location.href = paginaInicio(usuario.rol);
  } else {
    mostrarMensaje(mensaje, MENSAJES.CREDENCIALES_INVALIDAS, 'error');
    formulario.password.value = '';
  }
});
