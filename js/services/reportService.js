// Servicio de reportes: simula la API del backend usando localStorage.
import { REPORTES_INICIALES } from '../data/reportes.js';
import { leer, guardar } from './storage.js';
import { validarReporte, validarCambioEstado } from '../logic/reportes.js';

const CLAVE_REPORTES = 'sjl_reportes';

// Reportes de demostración + reportes nuevos o modificados (guardados en el navegador).
export function obtenerReportes() {
  const guardados = leer(CLAVE_REPORTES, []);
  const codigos = new Set(guardados.map((r) => r.codigo));
  return [...REPORTES_INICIALES.filter((r) => !codigos.has(r.codigo)), ...guardados];
}

function guardarReporte(reporte) {
  const guardados = leer(CLAVE_REPORTES, []).filter((r) => r.codigo !== reporte.codigo);
  guardar(CLAVE_REPORTES, [...guardados, reporte]);
}

export function hoyISO() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// HU06, HU07 y HU08
export function crearReporte(datos, sesion) {
  const resultado = validarReporte(datos, hoyISO());
  if (!resultado.ok) return resultado;

  const reporte = {
    codigo: `R-${Date.now().toString(36).toUpperCase()}`,
    tipo: datos.tipo,
    zona: datos.zona,
    fecha: datos.fecha,
    hora: datos.hora,
    descripcion: datos.descripcion.trim(),
    lat: datos.lat ?? null,
    lng: datos.lng ?? null,
    anonimo: Boolean(datos.anonimo),
    autorEmail: sesion.email,
    autorNombre: sesion.nombre,
    estado: 'Nuevo',
    comentario: '',
  };
  guardarReporte(reporte);
  return { ...resultado, reporte };
}

// HU09
export function reportesDeUsuario(email) {
  return obtenerReportes().filter((r) => r.autorEmail === email);
}

// HU15
export function cambiarEstado(codigo, estadoNuevo, comentario) {
  const reporte = obtenerReportes().find((r) => r.codigo === codigo);
  if (!reporte) return { ok: false, error: 'Reporte no encontrado' };

  const resultado = validarCambioEstado(reporte.estado, estadoNuevo, comentario);
  if (resultado.ok) {
    guardarReporte({ ...reporte, estado: estadoNuevo, comentario: String(comentario ?? '').trim() });
  }
  return resultado;
}
