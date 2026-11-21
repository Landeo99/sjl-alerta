// Lógica de autenticación: funciones puras, sin acceso al navegador.
// Por eso se pueden probar con tests automatizados (tests/auth.test.js).

export const ROLES = {
  VECINO: 'vecino',
  SERENAZGO: 'serenazgo',
  ADMIN: 'admin',
};

// Qué roles pueden entrar a cada página protegida (HU04).
// Las páginas que no están aquí son públicas.
export const PERMISOS = {
  perfil: [ROLES.VECINO, ROLES.SERENAZGO, ROLES.ADMIN],
  reportar: [ROLES.VECINO],
  'mis-reportes': [ROLES.VECINO],
  panel: [ROLES.SERENAZGO, ROLES.ADMIN],
  estadisticas: [ROLES.ADMIN],
};

export const MENSAJES = {
  CREDENCIALES_INVALIDAS: 'Correo o contraseña incorrectos',
  CORREO_REGISTRADO: 'El correo ya está registrado',
  CORREO_INVALIDO: 'Ingresa un correo válido',
  PASSWORD_CORTA: 'La contraseña debe tener al menos 8 caracteres',
  NOMBRE_OBLIGATORIO: 'El nombre es obligatorio',
  TELEFONO_INVALIDO: 'El teléfono debe tener 9 dígitos y empezar con 9',
  NO_AUTORIZADO: 'Acceso no autorizado',
};

export function normalizarEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarEmail(email));
}

export function esPasswordValida(password) {
  return typeof password === 'string' && password.length >= 8;
}

// Las contraseñas nunca se guardan en texto plano: se guarda su hash SHA-256.
export async function hashPassword(password) {
  const datos = new TextEncoder().encode(password);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// HU01: devuelve el usuario (sin su hash) si las credenciales son correctas, o null.
export async function autenticar(usuarios, email, password) {
  const correo = normalizarEmail(email);
  const usuario = usuarios.find((u) => u.email === correo);
  if (!usuario || typeof password !== 'string') return null;

  const hash = await hashPassword(password);
  if (hash !== usuario.passwordHash) return null;

  const { passwordHash, ...usuarioSinHash } = usuario;
  return usuarioSinHash;
}

// HU02: valida los datos del registro. Devuelve { ok, errores }.
export function validarRegistro(datos, usuarios) {
  const errores = {};
  if (!String(datos.nombre ?? '').trim()) errores.nombre = MENSAJES.NOMBRE_OBLIGATORIO;
  if (!esEmailValido(datos.email)) {
    errores.email = MENSAJES.CORREO_INVALIDO;
  } else if (usuarios.some((u) => u.email === normalizarEmail(datos.email))) {
    errores.email = MENSAJES.CORREO_REGISTRADO;
  }
  if (!esPasswordValida(datos.password)) errores.password = MENSAJES.PASSWORD_CORTA;
  return { ok: Object.keys(errores).length === 0, errores };
}

// HU05: valida los datos del perfil. El teléfono es opcional (celular peruano).
export function validarPerfil(datos) {
  const errores = {};
  if (!String(datos.nombre ?? '').trim()) errores.nombre = MENSAJES.NOMBRE_OBLIGATORIO;
  const telefono = String(datos.telefono ?? '').trim();
  if (telefono && !/^9\d{8}$/.test(telefono)) errores.telefono = MENSAJES.TELEFONO_INVALIDO;
  return { ok: Object.keys(errores).length === 0, errores };
}

// HU04: ¿el rol puede entrar a la página?
export function puedeAcceder(rol, pagina) {
  const permitidos = PERMISOS[pagina];
  if (!permitidos) return true; // página pública
  return permitidos.includes(rol);
}

// HU01: página a la que se envía a cada rol después de iniciar sesión.
export function paginaInicio(rol) {
  if (rol === ROLES.SERENAZGO || rol === ROLES.ADMIN) return 'panel.html';
  return 'index.html';
}
