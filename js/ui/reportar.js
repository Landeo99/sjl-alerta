// HU06, HU07 y HU08: registrar un incidente
import { pintarMenu, protegerPagina, mostrarMensaje, mostrarErroresDeCampos } from './layout.js';
import { crearReporte, hoyISO } from '../services/reportService.js';
import { TIPOS, ZONAS, estaDentroDeSJL, MENSAJES_REPORTE } from '../logic/reportes.js';

const sesion = protegerPagina('reportar');

if (sesion) {
  pintarMenu();
  const formulario = document.getElementById('form-reporte');
  const mensaje = document.getElementById('mensaje');
  let ubicacion = null;

  formulario.tipo.innerHTML += TIPOS.map((t) => `<option>${t}</option>`).join('');
  formulario.zona.innerHTML += ZONAS.map((z) => `<option>${z.nombre}</option>`).join('');
  formulario.fecha.max = hoyISO();

  // HU07: mapa para marcar la ubicación (Leaflet + OpenStreetMap)
  const L = window.L;
  const avisoUbicacion = document.querySelector('[data-error="ubicacion"]');
  if (L) {
    const mapa = L.map('mapa-reporte').setView([-11.99, -76.995], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(mapa);
    let marcador = null;
    mapa.on('click', (e) => {
      ubicacion = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (marcador) marcador.setLatLng(e.latlng);
      else marcador = L.marker(e.latlng).addTo(mapa);
      avisoUbicacion.textContent = estaDentroDeSJL(ubicacion.lat, ubicacion.lng)
        ? ''
        : MENSAJES_REPORTE.FUERA_DE_SJL;
    });
  } else {
    document.getElementById('mapa-reporte').textContent = 'No se pudo cargar el mapa (revisa tu conexión).';
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const resultado = crearReporte(
      {
        tipo: formulario.tipo.value,
        zona: formulario.zona.value,
        fecha: formulario.fecha.value,
        hora: formulario.hora.value,
        descripcion: formulario.descripcion.value,
        anonimo: formulario.anonimo.checked,
        lat: ubicacion?.lat,
        lng: ubicacion?.lng,
      },
      sesion,
    );

    mostrarErroresDeCampos(formulario, resultado.errores);
    avisoUbicacion.textContent = resultado.errores.ubicacion ?? '';
    if (resultado.ok) {
      mostrarMensaje(mensaje, `Reporte enviado con el código ${resultado.reporte.codigo}. Estado: Nuevo.`, 'exito');
      formulario.reset();
      window.scrollTo(0, 0);
    } else {
      mostrarMensaje(mensaje, 'Revisa los campos marcados en rojo.', 'error');
    }
  });
}
