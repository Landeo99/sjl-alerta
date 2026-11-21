// Capa de datos simulada: el navegador hace de "base de datos".
// localStorage  -> datos que se conservan (usuarios registrados, reportes).
// sessionStorage -> la sesión del usuario (se borra al cerrar la pestaña).

export function leer(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function leerSesion() {
  try {
    const valor = sessionStorage.getItem('sjl_sesion');
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  sessionStorage.setItem('sjl_sesion', JSON.stringify(sesion));
}

export function borrarSesion() {
  sessionStorage.removeItem('sjl_sesion');
}
