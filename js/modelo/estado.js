/* =========================================================
   MODELO · ESTADO DE LA APLICACIÓN
   Lo que el usuario tiene elegido en este momento. Solo los
   controladores lo cambian; las vistas reciben los valores.
   ========================================================= */
const estado = {
  usuario: null,     // usuario que inició sesión
  actual: 0,         // iglesia del carrusel de la portada
  elegida: 0,        // iglesia de la ficha completa y del mapa
  fotoGaleria: 0,    // foto grande de la galería de la ficha
  modoRuta: "pie",   // "pie" o "auto"
  piezas: [],        // tarjetas del carrusel de Libros o Arte sacro
  piezaActual: 0     // tarjeta del centro
};
