// HU10, HU11, HU12, HU13 y HU16: mapa de zonas de riesgo
import { pintarMenu, escaparHtml } from './layout.js';
import { obtenerReportes } from '../services/reportService.js';
import {
  TIPOS,
  ZONAS,
  FRANJAS,
  COLORES_RIESGO,
  filtrarReportes,
  resumenZona,
  debeAlertar,
} from '../logic/reportes.js';

pintarMenu();

const L = window.L;
const filtroTipo = document.getElementById('filtro-tipo');
const filtroFranja = document.getElementById('filtro-franja');
const alerta = document.getElementById('alerta');
const resumenCaja = document.getElementById('resumen');

filtroTipo.innerHTML += TIPOS.map((t) => `<option>${t}</option>`).join('');
filtroFranja.innerHTML += Object.entries(FRANJAS)
  .map(([clave, f]) => `<option value="${clave}">${f.nombre}</option>`)
  .join('');

if (!L) {
  document.getElementById('mapa').textContent = 'No se pudo cargar el mapa (revisa tu conexión).';
} else {
  const mapa = L.map('mapa').setView([-11.99, -76.995], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapa);
  const capa = L.layerGroup().addTo(mapa);

  function pintar() {
    capa.clearLayers();
    const reportes = filtrarReportes(obtenerReportes(), {
      tipo: filtroTipo.value,
      franja: filtroFranja.value,
    });

    // HU11: cada zona coloreada según su nivel de riesgo
    ZONAS.forEach((zona) => {
      const resumen = resumenZona(reportes, zona.nombre);
      L.circle([zona.lat, zona.lng], {
        radius: 550,
        color: COLORES_RIESGO[resumen.nivel],
        fillColor: COLORES_RIESGO[resumen.nivel],
        fillOpacity: 0.35,
      })
        .addTo(capa)
        .bindTooltip(`${zona.nombre}: riesgo ${resumen.nivel}`)
        .on('click', () => mostrarResumen(resumen));
    });

    // HU10: un marcador por incidente
    reportes
      .filter((r) => r.lat != null && r.lng != null)
      .forEach((r) => {
        L.circleMarker([r.lat, r.lng], { radius: 5, color: '#1b2a4a', weight: 1, fillOpacity: 0.9 })
          .addTo(capa)
          .bindPopup(
            `<strong>${escaparHtml(r.tipo)}</strong><br>${escaparHtml(r.zona)}<br>${escaparHtml(r.fecha)} - ${escaparHtml(r.hora)}`,
          );
      });

    document.getElementById('total').textContent = `${reportes.length} incidentes mostrados`;
  }

  // HU13 y HU16: resumen de la zona y alerta si el riesgo es alto
  function mostrarResumen(resumen) {
    resumenCaja.hidden = false;
    resumenCaja.innerHTML = `
      <h2>${escaparHtml(resumen.zona)}</h2>
      <p><span class="nivel" style="background:${COLORES_RIESGO[resumen.nivel]}">Riesgo ${resumen.nivel}</span></p>
      <ul>
        <li><strong>Total de incidentes:</strong> ${resumen.total}</li>
        <li><strong>Tipo más frecuente:</strong> ${escaparHtml(resumen.tipoMasFrecuente ?? '-')}</li>
        <li><strong>Horario de mayor riesgo:</strong> ${escaparHtml(resumen.horarioMayorRiesgo ?? '-')}</li>
      </ul>`;
    alerta.hidden = !debeAlertar(resumen);
    if (debeAlertar(resumen)) {
      alerta.innerHTML = `<strong>⚠️ Zona de alto riesgo: ${escaparHtml(resumen.zona)}.</strong>
        Evita transitar solo de noche, no muestres tu celular en la vía pública y ten a mano el número del serenazgo.`;
    }
  }

  filtroTipo.addEventListener('change', pintar);
  filtroFranja.addEventListener('change', pintar);
  document.getElementById('limpiar').addEventListener('click', () => {
    filtroTipo.value = '';
    filtroFranja.value = '';
    pintar();
  });
  pintar();
}
