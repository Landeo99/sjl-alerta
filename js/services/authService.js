// Servicio de autenticación: simula la API del backend.
import { USUARIOS_INICIALES } from '../data/usuarios.js';
import { leer, guardar, leerSesion, guardarSesion, borrarSesion } from './storage.js';
import {
  autenticar,
  hashPassword,
  normalizarEmail,
  validarRegistro,
  validarPerfil,
  ROLES,
} from '../logic/auth.js';

const CLAVE_USUARIOS = 'sjl_usuarios';

// Usuarios de demostración + usuarios registrados (los guardados reemplazan a los de demo).
export function obtenerUsuarios() {
  const guardados = leer(CLAVE_USUARIOS, []);
  const correosGuardados = new Set(guardados.map((u) => u.email));
  return [...USUARIOS_INICIALES.filter((u) => !correosGuardados.has(u.email)), ...guardados];
}

function guardarUsuario(usuario) {
  const guardados = leer(CLAVE_USUARIOS, []).filter((u) => u.email !== usuario.email);
  guardar(CLAVE_USUARIOS, [...guardados, usuario]);
}

// HU01
export async function iniciarSesion(email, password) {
  const usuario = await autenticar(obtenerUsuarios(), email, password);
  if (usuario) guardarSesion({ email: usuario.email, nombre: usuario.nombre, rol: usuario.rol });
  return usuario;
}

// HU02
export async function registrar(datos) {
  const resultado = validarRegistro(datos, obtenerUsuarios());
  if (!resultado.ok) return resultado;

  guardarUsuario({
    email: normalizarEmail(datos.email),
    nombre: datos.nombre.trim(),
    telefono: '',
    rol: ROLES.VECINO,
    passwordHash: await hashPassword(datos.password),
  });
  return resultado;
}

// HU03
export function cerrarSesion() {
  borrarSesion();
}

export function obtenerSesion() {
  return leerSesion();
}

// HU05
export function obtenerPerfil(email) {
  const usuario = obtenerUsuarios().find((u) => u.email === email);
  if (!usuario) return null;
  const { passwordHash, ...perfil } = usuario;
  return perfil;
}

export function actualizarPerfil(email, datos) {
  const resultado = validarPerfil(datos);
  if (!resultado.ok) return resultado;

  const usuario = obtenerUsuarios().find((u) => u.email === email);
  const actualizado = { ...usuario, nombre: datos.nombre.trim(), telefono: String(datos.telefono ?? '').trim() };
  guardarUsuario(actualizado);
  guardarSesion({ email: actualizado.email, nombre: actualizado.nombre, rol: actualizado.rol });
  return resultado;
}
