// HU17: panel de estadísticas (solo administrador)
import { pintarMenu, protegerPagina, escaparHtml } from './layout.js';
import { obtenerReportes } from '../services/reportService.js';
import { estadisticas, FRANJAS } from '../logic/reportes.js';

const sesion = protegerPagina('estadisticas');

if (sesion) {
  pintarMenu();
  const reportes = obtenerReportes();
  const datos = estadisticas(reportes);
  document.getElementById('total').textContent = `Total de reportes: ${reportes.length}`;

  const franjas = Object.fromEntries(
    Object.entries(datos.porFranja).map(([clave, n]) => [FRANJAS[clave].nombre, n]),
  );

  pintarBarras('grafico-tipo', datos.porTipo);
  pintarBarras('grafico-zona', datos.porZona);
  pintarBarras('grafico-franja', franjas);
}

// Gráfico de barras horizontal hecho con HTML y CSS (sin librerías externas).
function pintarBarras(id, conteo) {
  const filas = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const maximo = Math.max(...filas.map(([, n]) => n), 1);
  document.getElementById(id).innerHTML = filas
    .map(
      ([etiqueta, n]) => `<div class="barra-fila">
        <span class="barra-etiqueta">${escaparHtml(etiqueta)}</span>
        <span class="barra-pista"><span class="barra-valor" style="width:${(n / maximo) * 100}%"></span></span>
        <span class="barra-numero">${n}</span>
      </div>`,
    )
    .join('');
}
