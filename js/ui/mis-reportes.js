// HU09: ver mis reportes y su estado
import { pintarMenu, protegerPagina, escaparHtml } from './layout.js';
import { reportesDeUsuario } from '../services/reportService.js';
import { ordenarPorFecha } from '../logic/reportes.js';

const sesion = protegerPagina('mis-reportes');

if (sesion) {
  pintarMenu();
  const reportes = ordenarPorFecha(reportesDeUsuario(sesion.email));
  const contenedor = document.getElementById('lista');

  if (reportes.length === 0) {
    contenedor.innerHTML = '<p class="vacio">Aún no tienes reportes</p>';
  } else {
    contenedor.innerHTML = `
      <table class="tabla">
        <thead><tr><th>Código</th><th>Tipo</th><th>Zona</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Respuesta</th></tr></thead>
        <tbody>
          ${reportes
            .map(
              (r) => `<tr>
                <td>${escaparHtml(r.codigo)}</td><td>${escaparHtml(r.tipo)}</td><td>${escaparHtml(r.zona)}</td>
                <td>${escaparHtml(r.fecha)}</td><td>${escaparHtml(r.hora)}</td>
                <td><span class="estado ${estadoCss(r.estado)}">${escaparHtml(r.estado)}</span></td>
                <td>${escaparHtml(r.comentario) || '-'}</td>
              </tr>`,
            )
            .join('')}
        </tbody>
      </table>`;
  }
}

function estadoCss(estado) {
  return { Nuevo: 'nuevo', 'En atención': 'atencion', Atendido: 'atendido' }[estado] ?? '';
}
