// Reglas de negocio de los reportes y zonas de riesgo: funciones puras, probadas en tests/reportes.test.js

export const TIPOS = [
  'Robo al paso',
  'Asalto en transporte público',
  'Extorsión',
  'Microcomercialización de drogas',
];

export const ESTADOS = ['Nuevo', 'En atención', 'Atendido'];

// Zonas de San Juan de Lurigancho (coordenadas aproximadas del centro de cada zona).
export const ZONAS = [
  { nombre: 'Zárate', lat: -12.0235, lng: -77.0005 },
  { nombre: 'Caja de Agua', lat: -12.029, lng: -77.013 },
  { nombre: 'Mangomarca', lat: -12.0135, lng: -76.994 },
  { nombre: 'Campoy', lat: -12.023, lng: -76.972 },
  { nombre: 'San Carlos', lat: -11.993, lng: -77.001 },
  { nombre: 'Canto Grande', lat: -11.979, lng: -77.004 },
  { nombre: 'Huáscar', lat: -11.962, lng: -77.004 },
  { nombre: 'Montenegro', lat: -11.969, lng: -76.985 },
  { nombre: 'Bayóvar', lat: -11.955, lng: -76.993 },
  { nombre: 'Motupe', lat: -11.946, lng: -77.006 },
];

// Límites aproximados del distrito (HU07).
export const LIMITES_SJL = { latMin: -12.04, latMax: -11.93, lngMin: -77.03, lngMax: -76.95 };

export const FRANJAS = {
  madrugada: { nombre: 'Madrugada (00:00 - 05:59)', desde: 0, hasta: 5 },
  manana: { nombre: 'Mañana (06:00 - 11:59)', desde: 6, hasta: 11 },
  tarde: { nombre: 'Tarde (12:00 - 17:59)', desde: 12, hasta: 17 },
  noche: { nombre: 'Noche (18:00 - 23:59)', desde: 18, hasta: 23 },
};

export const MENSAJES_REPORTE = {
  OBLIGATORIO: 'Este campo es obligatorio',
  FUERA_DE_SJL: 'La ubicación debe estar dentro de SJL',
  FECHA_FUTURA: 'La fecha no puede ser futura',
  COMENTARIO_OBLIGATORIO: 'Describe la acción realizada',
  ESTADO_INVALIDO: 'Cambio de estado no permitido',
};

export function estaDentroDeSJL(lat, lng) {
  const l = LIMITES_SJL;
  return lat >= l.latMin && lat <= l.latMax && lng >= l.lngMin && lng <= l.lngMax;
}

// HU06 y HU07: valida un reporte nuevo. hoy = 'AAAA-MM-DD'.
export function validarReporte(datos, hoy) {
  const errores = {};
  for (const campo of ['tipo', 'zona', 'fecha', 'hora', 'descripcion']) {
    if (!String(datos[campo] ?? '').trim()) errores[campo] = MENSAJES_REPORTE.OBLIGATORIO;
  }
  if (datos.tipo && !TIPOS.includes(datos.tipo)) errores.tipo = MENSAJES_REPORTE.OBLIGATORIO;
  if (datos.fecha && hoy && datos.fecha > hoy) errores.fecha = MENSAJES_REPORTE.FECHA_FUTURA;
  if (datos.lat != null && datos.lng != null && !estaDentroDeSJL(datos.lat, datos.lng)) {
    errores.ubicacion = MENSAJES_REPORTE.FUERA_DE_SJL;
  }
  return { ok: Object.keys(errores).length === 0, errores };
}

// HU12: franja horaria a partir de 'HH:MM'.
export function franjaHoraria(hora) {
  const h = Number(String(hora).split(':')[0]);
  return Object.keys(FRANJAS).find((clave) => h >= FRANJAS[clave].desde && h <= FRANJAS[clave].hasta);
}

// HU11: nivel de riesgo según la cantidad de incidentes.
export function nivelRiesgo(cantidad) {
  if (cantidad >= 10) return 'Alto';
  if (cantidad >= 5) return 'Medio';
  return 'Bajo';
}

export const COLORES_RIESGO = { Alto: '#d62839', Medio: '#f2b705', Bajo: '#2a9d5c' };

// HU12: filtra por tipo y franja ('' o undefined = todos).
export function filtrarReportes(reportes, { tipo, franja } = {}) {
  return reportes.filter(
    (r) => (!tipo || r.tipo === tipo) && (!franja || franjaHoraria(r.hora) === franja),
  );
}

// HU09 y HU14: ordena del más reciente al más antiguo.
export function ordenarPorFecha(reportes) {
  return [...reportes].sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
}

// HU14: primero los "Nuevo", luego "En atención" y al final "Atendido"; dentro de cada grupo, los más recientes.
export function ordenarParaPanel(reportes) {
  return ordenarPorFecha(reportes).sort((a, b) => ESTADOS.indexOf(a.estado) - ESTADOS.indexOf(b.estado));
}

function masFrecuente(valores) {
  const conteo = contar(valores);
  return Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a])[0] ?? null;
}

export function contar(valores) {
  return valores.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {});
}

// HU11 y HU13: resumen de una zona.
export function resumenZona(reportes, nombreZona) {
  const deZona = reportes.filter((r) => r.zona === nombreZona);
  const franja = masFrecuente(deZona.map((r) => franjaHoraria(r.hora)));
  return {
    zona: nombreZona,
    total: deZona.length,
    nivel: nivelRiesgo(deZona.length),
    tipoMasFrecuente: masFrecuente(deZona.map((r) => r.tipo)),
    horarioMayorRiesgo: franja ? FRANJAS[franja].nombre : null,
  };
}

// HU16: ¿se debe mostrar la alerta de zona de alto riesgo?
export function debeAlertar(resumen) {
  return resumen.nivel === 'Alto';
}

// HU15: valida el cambio de estado (solo hacia adelante; "Atendido" exige comentario).
export function validarCambioEstado(estadoActual, estadoNuevo, comentario) {
  const actual = ESTADOS.indexOf(estadoActual);
  const nuevo = ESTADOS.indexOf(estadoNuevo);
  if (nuevo === -1 || nuevo <= actual) return { ok: false, error: MENSAJES_REPORTE.ESTADO_INVALIDO };
  if (estadoNuevo === 'Atendido' && !String(comentario ?? '').trim()) {
    return { ok: false, error: MENSAJES_REPORTE.COMENTARIO_OBLIGATORIO };
  }
  return { ok: true, error: null };
}

// HU17: datos de los tres gráficos.
export function estadisticas(reportes) {
  return {
    porTipo: contar(reportes.map((r) => r.tipo)),
    porZona: contar(reportes.map((r) => r.zona)),
    porFranja: contar(reportes.map((r) => franjaHoraria(r.hora))),
  };
}

// HU18: convierte los reportes a CSV (los anónimos no exponen al autor).
export function aCSV(reportes) {
  const columnas = ['codigo', 'tipo', 'zona', 'fecha', 'hora', 'estado', 'autor', 'descripcion'];
  const celda = (valor) => `"${String(valor ?? '').replaceAll('"', '""')}"`;
  const filas = reportes.map((r) =>
    [r.codigo, r.tipo, r.zona, r.fecha, r.hora, r.estado, r.anonimo ? 'Anónimo' : r.autorNombre, r.descripcion]
      .map(celda)
      .join(','),
  );
  return [columnas.join(','), ...filas].join('\n');
}
