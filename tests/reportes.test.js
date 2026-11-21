import { describe, it, expect } from 'vitest';
import {
  validarReporte,
  estaDentroDeSJL,
  franjaHoraria,
  nivelRiesgo,
  filtrarReportes,
  ordenarPorFecha,
  ordenarParaPanel,
  resumenZona,
  debeAlertar,
  validarCambioEstado,
  estadisticas,
  aCSV,
  MENSAJES_REPORTE,
} from '../js/logic/reportes.js';
import { puedeAcceder } from '../js/logic/auth.js';

const HOY = '2026-11-20';
const reporteValido = {
  tipo: 'Robo al paso',
  zona: 'Zárate',
  fecha: '2026-11-19',
  hora: '20:30',
  descripcion: 'Me robaron el celular',
};

function crear(zona, hora = '10:00', extra = {}) {
  return { codigo: `R-${Math.random()}`, tipo: 'Robo al paso', zona, fecha: '2026-11-01', hora, estado: 'Nuevo', ...extra };
}

describe('HU06 - Registrar un incidente', () => {
  it('acepta un reporte con todos los campos obligatorios', () => {
    expect(validarReporte(reporteValido, HOY).ok).toBe(true);
  });

  it('rechaza un reporte con campos vacíos', () => {
    const resultado = validarReporte({ ...reporteValido, descripcion: '  ', zona: '' }, HOY);
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.descripcion).toBe(MENSAJES_REPORTE.OBLIGATORIO);
    expect(resultado.errores.zona).toBe(MENSAJES_REPORTE.OBLIGATORIO);
  });

  it('rechaza una fecha futura', () => {
    expect(validarReporte({ ...reporteValido, fecha: '2026-12-01' }, HOY).errores.fecha).toBe(
      MENSAJES_REPORTE.FECHA_FUTURA,
    );
  });
});

describe('HU07 - Ubicación dentro de SJL', () => {
  it('acepta un punto dentro del distrito', () => {
    expect(estaDentroDeSJL(-11.99, -77.0)).toBe(true);
  });

  it('rechaza un punto fuera del distrito (Miraflores)', () => {
    expect(estaDentroDeSJL(-12.12, -77.03)).toBe(false);
    expect(validarReporte({ ...reporteValido, lat: -12.12, lng: -77.03 }, HOY).errores.ubicacion).toBe(
      MENSAJES_REPORTE.FUERA_DE_SJL,
    );
  });
});

describe('HU09 y HU14 - Orden de los reportes', () => {
  it('ordena del más reciente al más antiguo', () => {
    const lista = [crear('Zárate', '08:00', { fecha: '2026-11-01' }), crear('Zárate', '09:00', { fecha: '2026-11-05' })];
    expect(ordenarPorFecha(lista)[0].fecha).toBe('2026-11-05');
  });

  it('en el panel muestra primero los reportes "Nuevo"', () => {
    const lista = [crear('Zárate', '10:00', { estado: 'Atendido' }), crear('Zárate', '10:00', { estado: 'Nuevo' })];
    expect(ordenarParaPanel(lista)[0].estado).toBe('Nuevo');
  });
});

describe('HU11 - Nivel de riesgo por zona', () => {
  it('10 o más incidentes es riesgo Alto', () => {
    expect(nivelRiesgo(10)).toBe('Alto');
  });

  it('de 5 a 9 incidentes es riesgo Medio', () => {
    expect(nivelRiesgo(5)).toBe('Medio');
    expect(nivelRiesgo(9)).toBe('Medio');
  });

  it('menos de 5 incidentes es riesgo Bajo', () => {
    expect(nivelRiesgo(4)).toBe('Bajo');
    expect(nivelRiesgo(0)).toBe('Bajo');
  });
});

describe('HU12 - Filtro por tipo y franja horaria', () => {
  it('clasifica la hora en su franja', () => {
    expect(franjaHoraria('03:15')).toBe('madrugada');
    expect(franjaHoraria('06:00')).toBe('manana');
    expect(franjaHoraria('17:59')).toBe('tarde');
    expect(franjaHoraria('18:00')).toBe('noche');
    expect(franjaHoraria('23:59')).toBe('noche');
  });

  it('filtra por tipo y franja a la vez', () => {
    const lista = [
      crear('Zárate', '20:00'),
      crear('Zárate', '10:00'),
      crear('Zárate', '21:00', { tipo: 'Extorsión' }),
    ];
    expect(filtrarReportes(lista, { tipo: 'Robo al paso', franja: 'noche' })).toHaveLength(1);
  });

  it('sin filtros devuelve todos los reportes', () => {
    expect(filtrarReportes([crear('Zárate'), crear('Campoy')], {})).toHaveLength(2);
  });
});

describe('HU13 y HU16 - Resumen de zona y alerta', () => {
  const lista = [
    ...Array.from({ length: 10 }, () => crear('Zárate', '21:00')),
    crear('Zárate', '09:00', { tipo: 'Extorsión' }),
    crear('Campoy', '09:00'),
  ];

  it('calcula el resumen de la zona', () => {
    const resumen = resumenZona(lista, 'Zárate');
    expect(resumen.total).toBe(11);
    expect(resumen.nivel).toBe('Alto');
    expect(resumen.tipoMasFrecuente).toBe('Robo al paso');
    expect(resumen.horarioMayorRiesgo).toBe('Noche (18:00 - 23:59)');
  });

  it('alerta solo en zonas de riesgo Alto', () => {
    expect(debeAlertar(resumenZona(lista, 'Zárate'))).toBe(true);
    expect(debeAlertar(resumenZona(lista, 'Campoy'))).toBe(false);
  });
});

describe('HU15 - Cambiar el estado de un reporte', () => {
  it('permite pasar de "Nuevo" a "En atención"', () => {
    expect(validarCambioEstado('Nuevo', 'En atención', '').ok).toBe(true);
  });

  it('exige un comentario para marcar como "Atendido"', () => {
    expect(validarCambioEstado('En atención', 'Atendido', '').error).toBe(MENSAJES_REPORTE.COMENTARIO_OBLIGATORIO);
    expect(validarCambioEstado('En atención', 'Atendido', 'Se envió patrullaje').ok).toBe(true);
  });

  it('no permite retroceder de estado', () => {
    expect(validarCambioEstado('Atendido', 'Nuevo', 'x').ok).toBe(false);
  });
});

describe('HU17 y HU18 - Estadísticas y exportación', () => {
  const lista = [
    crear('Zárate', '20:00'),
    crear('Campoy', '09:00', { tipo: 'Extorsión', anonimo: true, autorNombre: 'Ana' }),
  ];

  it('cuenta incidentes por tipo, zona y franja', () => {
    const datos = estadisticas(lista);
    expect(datos.porTipo['Extorsión']).toBe(1);
    expect(datos.porZona['Zárate']).toBe(1);
    expect(datos.porFranja.noche).toBe(1);
  });

  it('genera un CSV con encabezado y una fila por reporte', () => {
    expect(aCSV(lista).split('\n')).toHaveLength(3);
  });

  it('no expone al autor de un reporte anónimo (HU08)', () => {
    const csv = aCSV(lista);
    expect(csv).toContain('Anónimo');
    expect(csv.includes('Ana')).toBe(false);
  });

  it('solo el administrador accede a estadísticas', () => {
    expect(puedeAcceder('admin', 'estadisticas')).toBe(true);
    expect(puedeAcceder('serenazgo', 'estadisticas')).toBe(false);
    expect(puedeAcceder('vecino', 'reportar')).toBe(true);
    expect(puedeAcceder('serenazgo', 'reportar')).toBe(false);
  });
});
