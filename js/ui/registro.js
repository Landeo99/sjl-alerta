// HU02: registrarse como vecino
import { pintarMenu, mostrarErroresDeCampos } from './layout.js';
import { registrar } from '../services/authService.js';

pintarMenu();

const formulario = document.getElementById('form-registro');

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const resultado = await registrar({
    nombre: formulario.nombre.value,
    email: formulario.email.value,
    password: formulario.password.value,
  });

  mostrarErroresDeCampos(formulario, resultado.errores);
  if (resultado.ok) location.href = 'login.html?registro=ok';
});
