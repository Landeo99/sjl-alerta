// HU14, HU15 y HU18: panel de atención para serenazgo y comisaría
import { pintarMenu, protegerPagina, mostrarErrorDeAcceso, mostrarMensaje, escaparHtml } from './layout.js';
import { obtenerReportes, cambiarEstado } from '../services/reportService.js';
import { ordenarParaPanel, ESTADOS, aCSV } from '../logic/reportes.js';

const sesion = protegerPagina('panel');

if (sesion) {
  pintarMenu();
  const mensaje = document.getElementById('mensaje');
  mostrarErrorDeAcceso(mensaje);
  document.getElementById('bienvenida').textContent = `Bienvenido(a), ${sesion.nombre}.`;

  const filtroEstado = document.getElementById('filtro-estado');
  const tabla = document.getElementById('tabla-reportes');
  filtroEstado.innerHTML += ESTADOS.map((e) => `<option>${e}</option>`).join('');

  function reportesVisibles() {
    const todos = ordenarParaPanel(obtenerReportes());
    return filtroEstado.value ? todos.filter((r) => r.estado === filtroEstado.value) : todos;
  }

  function pintar() {
    const reportes = reportesVisibles();
    document.getElementById('conteo').textContent = `${reportes.length} reportes`;
    tabla.innerHTML = reportes
      .map((r) => {
        const siguientes = ESTADOS.slice(ESTADOS.indexOf(r.estado) + 1);
        const acciones = siguientes.length
          ? `<select data-codigo="${escaparHtml(r.codigo)}" class="sel-estado">
               ${siguientes.map((e) => `<option>${e}</option>`).join('')}
             </select>
             <input type="text" class="comentario" placeholder="Acción realizada" data-comentario="${escaparHtml(r.codigo)}">
             <button class="btn btn-chico" data-guardar="${escaparHtml(r.codigo)}">Guardar</button>`
          : escaparHtml(r.comentario || '-');
        return `<tr>
          <td>${escaparHtml(r.codigo)}</td>
          <td><span class="estado ${estadoCss(r.estado)}">${escaparHtml(r.estado)}</span></td>
          <td>${escaparHtml(r.tipo)}</td><td>${escaparHtml(r.zona)}</td>
          <td>${escaparHtml(r.fecha)} ${escaparHtml(r.hora)}</td>
          <td>${r.anonimo ? '<em>Anónimo</em>' : escaparHtml(r.autorNombre)}</td>
          <td class="desc">${escaparHtml(r.descripcion)}</td>
          <td class="acciones-celda">${acciones}</td>
        </tr>`;
      })
      .join('');
  }

  // HU15: cambiar estado
  tabla.addEventListener('click', (evento) => {
    const codigo = evento.target.dataset.guardar;
    if (!codigo) return;
    const estado = tabla.querySelector(`[data-codigo="${codigo}"]`).value;
    const comentario = tabla.querySelector(`[data-comentario="${codigo}"]`).value;
    const resultado = cambiarEstado(codigo, estado, comentario);
    if (resultado.ok) {
      mostrarMensaje(mensaje, `Reporte ${codigo} actualizado a "${estado}".`, 'exito');
      pintar();
    } else {
      mostrarMensaje(mensaje, resultado.error, 'error');
    }
  });

  // HU18: exportar a CSV
  document.getElementById('exportar').addEventListener('click', () => {
    const blob = new Blob(['﻿' + aCSV(reportesVisibles())], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'reportes-sjl.csv';
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  });

  filtroEstado.addEventListener('change', pintar);
  pintar();
}

function estadoCss(estado) {
  return { Nuevo: 'nuevo', 'En atención': 'atencion', Atendido: 'atendido' }[estado] ?? '';
}
