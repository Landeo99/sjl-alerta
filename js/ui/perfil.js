// HU05: ver y editar mi perfil
import { pintarMenu, protegerPagina, mostrarMensaje, mostrarErroresDeCampos } from './layout.js';
import { obtenerPerfil, actualizarPerfil } from '../services/authService.js';

const sesion = protegerPagina('perfil');

if (sesion) {
  pintarMenu();
  const formulario = document.getElementById('form-perfil');
  const mensaje = document.getElementById('mensaje');
  const perfil = obtenerPerfil(sesion.email);

  formulario.email.value = perfil.email;
  formulario.rol.value = perfil.rol;
  formulario.nombre.value = perfil.nombre;
  formulario.telefono.value = perfil.telefono ?? '';

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const resultado = actualizarPerfil(sesion.email, {
      nombre: formulario.nombre.value,
      telefono: formulario.telefono.value,
    });
    mostrarErroresDeCampos(formulario, resultado.errores);
    if (resultado.ok) {
      mostrarMensaje(mensaje, 'Datos actualizados', 'exito');
      pintarMenu();
    } else {
      mensaje.hidden = true;
    }
  });
}
