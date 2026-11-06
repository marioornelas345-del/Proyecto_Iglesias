/* =========================================================
   MODELO · ALMACÉN DEL NAVEGADOR (localStorage)
   Único lugar que toca localStorage: si mañana los datos se
   guardan en un servidor, solo cambia este archivo.
   ========================================================= */
function leerJSON(clave, porDefecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
}

/** Devuelve false si el navegador no pudo guardarlo. */
function guardarJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // navegador sin almacenamiento o sin espacio
  }
}
