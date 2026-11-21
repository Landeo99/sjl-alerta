// Usuarios de demostración (simulan la base de datos).
// Las contraseñas están guardadas como hash SHA-256; las credenciales de prueba están en el README.
export const USUARIOS_INICIALES = [
  {
    email: 'vecino@sjlalerta.pe',
    nombre: 'Vecino Demo',
    telefono: '',
    rol: 'vecino',
    passwordHash: '5503a7e227b0432953d5fc77194fb73f4c9ce355e8fd780fdef20c62d896f8da',
  },
  {
    email: 'serenazgo@sjlalerta.pe',
    nombre: 'Agente de Serenazgo',
    telefono: '',
    rol: 'serenazgo',
    passwordHash: '903426e2421e75494c5d477619ec7172afaa5f885ebf1546f7f71ec780845337',
  },
  {
    email: 'admin@sjlalerta.pe',
    nombre: 'Administrador',
    telefono: '',
    rol: 'admin',
    passwordHash: '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
  },
];
