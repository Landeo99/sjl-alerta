# SJL Alerta

Plataforma web de reportes ciudadanos y mapa de zonas de riesgo para San Juan de Lurigancho.

## Enlaces
- Solución desplegada: https://landeo99.github.io/sjl-alerta/ (disponible al terminar el pipeline de despliegue)
- Proyecto en Jira: (pendiente)

## Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Vecino | vecino@sjlalerta.pe | Vecino123! |
| Serenazgo | serenazgo@sjlalerta.pe | Serenazgo123! |
| Administrador | admin@sjlalerta.pe | Admin123! |

> Son cuentas de demostración. Las contraseñas se almacenan como hash SHA-256, nunca en texto plano.

## Cómo ejecutarlo en local
1. Abrir la carpeta en Visual Studio Code.
2. Clic derecho sobre `index.html` → **Open with Live Server**.

## Cómo ejecutar las pruebas
```bash
npm install
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
└── tests/            Pruebas automatizadas (Vitest)
```

## Autor
Diego Landeo
