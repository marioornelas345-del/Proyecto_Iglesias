/* =========================================================
   MODELO · PIEZAS DE LOS CARRUSELES
   Convierte los libros y el arte sacro de PATRIMONIO en tarjetas
   con todo lo que la vista necesita (nombre, foto, historia...).
   ========================================================= */

/** Libros de la iglesia; primero los que se pueden leer en línea. */
function piezasDeLibros(t) {
  const piezas = PATRIMONIO[t.clave].libros.map((l) => ({
    nombre: l.titulo,
    grupo: l.fecha,
    detalle: l.detalle || "",
    nota: l.lugar ? `Se conserva en: ${l.lugar}` : "",
    enLinea: l.enLinea,
    pagina: l.pagina,
    hoja: l.hoja,
    libro: true,
    digital: LIBROS_DIGITALES[l.enLinea],
    // Portada real si el libro está digitalizado; si no, la tarjeta dibuja una portada ilustrada
    fotoPropia: LIBROS_DIGITALES[l.enLinea] && { foto: LIBROS_DIGITALES[l.enLinea].portada, pagina: l.enLinea },
    aviso: "este libro"
  }));
  return conFotos(piezas.sort((a, b) => Boolean(b.digital) - Boolean(a.digital)), t);
}

/** Arte sacro en el orden de las categorías; primero las piezas con foto propia. */
function piezasDeArte(t) {
  const arte = PATRIMONIO[t.clave].arte;
  const piezas = CATEGORIAS_ARTE.flatMap((c) => (arte[c.clave] || []).map((o) => ({
    nombre: o.nombre,
    grupo: c.nombre,
    detalle: o.detalle,
    ...EXPLICACIONES[`${t.clave}/${o.nombre}`], // significado y creacion
    nota: c.definicion,
    estado: o.perdida ? "Perdido" : o.sinConfirmar ? "Sin confirmar hoy" : "",
    fotoPropia: o.fotoLocal || (o.foto && buscarFoto(o.foto)), // foto de la pieza (la guardada en img/ tiene prioridad)
    aviso: "esta pieza"
  })));
  return conFotos(piezas.sort((a, b) => Boolean(b.fotoPropia) - Boolean(a.fotoPropia)), t);
}

/** Si la pieza no tiene foto propia usa una foto del templo (los libros sin portada quedan ilustrados). */
function conFotos(piezas, t) {
  const fotos = t.galeria.map(buscarFoto).filter(Boolean);
  piezas.forEach((p, i) => { p.foto = p.fotoPropia || (p.libro ? null : fotos[i % fotos.length]); });
  return piezas;
}
