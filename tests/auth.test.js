import { describe, it, expect } from 'vitest';
import {
  autenticar,
  hashPassword,
  validarRegistro,
  validarPerfil,
  puedeAcceder,
  paginaInicio,
  esEmailValido,
  MENSAJES,
} from '../js/logic/auth.js';
import { USUARIOS_INICIALES } from '../js/data/usuarios.js';

describe('HU01 - Iniciar sesión según rol', () => {
  it('devuelve el usuario cuando las credenciales son válidas', async () => {
    const usuario = await autenticar(USUARIOS_INICIALES, 'vecino@sjlalerta.pe', 'Vecino123!');
    expect(usuario.rol).toBe('vecino');
  });

  it('no devuelve el hash de la contraseña', async () => {
    const usuario = await autenticar(USUARIOS_INICIALES, 'vecino@sjlalerta.pe', 'Vecino123!');
    expect(usuario.passwordHash).toBe(undefined);
  });

  it('acepta el correo con mayúsculas o espacios', async () => {
    const usuario = await autenticar(USUARIOS_INICIALES, '  VECINO@sjlalerta.pe ', 'Vecino123!');
    expect(usuario.email).toBe('vecino@sjlalerta.pe');
  });

  it('devuelve null con una contraseña incorrecta', async () => {
    expect(await autenticar(USUARIOS_INICIALES, 'vecino@sjlalerta.pe', 'otra-clave')).toBe(null);
  });

  it('devuelve null con un correo que no existe', async () => {
    expect(await autenticar(USUARIOS_INICIALES, 'nadie@sjlalerta.pe', 'Vecino123!')).toBe(null);
  });

  it('envía a cada rol a su página de inicio', () => {
    expect(paginaInicio('vecino')).toBe('index.html');
    expect(paginaInicio('serenazgo')).toBe('panel.html');
    expect(paginaInicio('admin')).toBe('panel.html');
  });
});

describe('HU02 - Registrarse como vecino', () => {
  const datosValidos = { nombre: 'Ana Pérez', email: 'ana@correo.pe', password: 'clave1234' };

  it('acepta datos válidos', () => {
    expect(validarRegistro(datosValidos, USUARIOS_INICIALES).ok).toBe(true);
  });

  it('rechaza un correo ya registrado', () => {
    const resultado = validarRegistro({ ...datosValidos, email: 'vecino@sjlalerta.pe' }, USUARIOS_INICIALES);
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.email).toBe(MENSAJES.CORREO_REGISTRADO);
  });

  it('rechaza una contraseña de menos de 8 caracteres', () => {
    const resultado = validarRegistro({ ...datosValidos, password: '1234567' }, USUARIOS_INICIALES);
    expect(resultado.errores.password).toBe(MENSAJES.PASSWORD_CORTA);
  });

  it('rechaza un correo con formato inválido', () => {
    expect(esEmailValido('ana@correo')).toBe(false);
    expect(esEmailValido('ana@correo.pe')).toBe(true);
  });

  it('guarda la contraseña como hash SHA-256 y no en texto plano', async () => {
    const hash = await hashPassword('clave1234');
    expect(hash.length).toBe(64);
    expect(hash).not.toBe('clave1234');
  });
});

describe('HU03 y HU04 - Control de acceso por rol', () => {
  it('impide que un vecino entre al panel', () => {
    expect(puedeAcceder('vecino', 'panel')).toBe(false);
  });

  it('permite que serenazgo y admin entren al panel', () => {
    expect(puedeAcceder('serenazgo', 'panel')).toBe(true);
    expect(puedeAcceder('admin', 'panel')).toBe(true);
  });

  it('impide el acceso a páginas protegidas sin sesión', () => {
    expect(puedeAcceder(undefined, 'perfil')).toBe(false);
  });

  it('permite el acceso a páginas públicas', () => {
    expect(puedeAcceder(undefined, 'inicio')).toBe(true);
  });
});

describe('HU05 - Ver y editar mi perfil', () => {
  it('acepta un nombre y un celular válidos', () => {
    expect(validarPerfil({ nombre: 'Ana', telefono: '987654321' }).ok).toBe(true);
  });

  it('acepta el teléfono vacío porque es opcional', () => {
    expect(validarPerfil({ nombre: 'Ana', telefono: '' }).ok).toBe(true);
  });

  it('rechaza el nombre vacío', () => {
    expect(validarPerfil({ nombre: '  ', telefono: '' }).errores.nombre).toBe(MENSAJES.NOMBRE_OBLIGATORIO);
  });

  it('rechaza un teléfono inválido', () => {
    expect(validarPerfil({ nombre: 'Ana', telefono: '12345' }).errores.telefono).toBe(MENSAJES.TELEFONO_INVALIDO);
  });
});
