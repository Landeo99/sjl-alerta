# SJL Alerta

[![CI/CD SJL Alerta](https://github.com/Landeo99/sjl-alerta/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Landeo99/sjl-alerta/actions/workflows/ci-cd.yml)

Plataforma web de reportes ciudadanos y mapa de zonas de riesgo para **San Juan de Lurigancho**: los vecinos reportan incidentes (robos al paso, asaltos en transporte, extorsiones, microcomercialización de drogas), consultan en un mapa qué zonas y horarios concentran más riesgo, y el serenazgo atiende los reportes desde su panel.

## Enlaces
| Recurso | Enlace |
|---|---|
| 🌐 Solución desplegada | https://landeo99.github.io/sjl-alerta/ |
| 📋 Proyecto en Jira | (pendiente) |
| ⚙️ Pipeline CI/CD | [Pestaña Actions](https://github.com/Landeo99/sjl-alerta/actions) |
| 🔀 Pull Requests | [Pull requests cerrados](https://github.com/Landeo99/sjl-alerta/pulls?q=is%3Apr) |

## Documentación de la práctica
| Pregunta | Documento |
|---|---|
| P1 — Product Backlog | Proyecto en Jira (épicas E1–E5, historias HU01–HU19) |
| P2 — Sprints, burndown, velocidad, Gantt y Kanban | [docs/sprints.md](docs/sprints.md) |
| P3 — Arquitectura lógica | [docs/arquitectura.md](docs/arquitectura.md) |
| P3 — Stack DevSecOps | [docs/devsecops.md](docs/devsecops.md) |
| P4 — Pipeline | [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) |

## Funcionalidades
- Registro, inicio de sesión y acceso según rol (vecino, serenazgo, administrador).
- Reporte de incidentes con ubicación en el mapa y opción anónima.
- Mapa de zonas de riesgo coloreadas por nivel (Alto ≥ 10, Medio 5–9, Bajo < 5), con filtros por tipo y franja horaria y alerta en zonas de alto riesgo.
- Panel de serenazgo para cambiar el estado de los reportes y exportarlos a CSV.
- Estadísticas por tipo, zona y franja horaria.

## Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Vecino | vecino@sjlalerta.pe | Vecino123! |
| Serenazgo | serenazgo@sjlalerta.pe | Serenazgo123! |
| Administrador | admin@sjlalerta.pe | Admin123! |

> Son cuentas de demostración. Las contraseñas se almacenan como hash SHA-256, nunca en texto plano.

## Estrategia de ramas
- `main`: producción. Solo recibe cambios por Pull Request; cada push a `main` despliega en GitHub Pages.
- `test`: desarrollo y pruebas. Cada push ejecuta build, pruebas y análisis de seguridad.

## Pipeline CI/CD
1. **Build:** `npm ci` + ESLint.
2. **Test:** 41 pruebas unitarias con Vitest (reporte JUnit como artefacto).
3. **Security:** `npm audit` (dependencias), Gitleaks (secretos) y CodeQL (SAST).
4. **Deploy:** GitHub Pages (solo desde `main`).

## Cómo ejecutarlo en local
1. Abrir la carpeta en Visual Studio Code.
2. Clic derecho sobre `index.html` → **Open with Live Server**.

```bash
npm install
npm run lint
npm test
```

## Estructura del proyecto
```
├── *.html            Páginas (interfaz)
├── css/              Estilos
├── js/
│   ├── logic/        Reglas de negocio (funciones puras, probadas con tests)
│   ├── services/     API simulada y almacenamiento (localStorage / sessionStorage)
│   ├── data/         Datos de demostración
│   └── ui/           Comportamiento de cada página
├── tests/            Pruebas automatizadas (Vitest)
├── docs/             Documentación (sprints, arquitectura, DevSecOps)
└── .github/          Pipeline CI/CD y Dependabot
```

## Autor
Diego Landeo
