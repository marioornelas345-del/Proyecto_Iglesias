/* =========================================================
   FOTOS REALES (guardadas en la carpeta img/)
   ========================================================= */
const textoPlano = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  // Escapamos < > & porque el crédito se inserta con innerHTML
  return div.textContent.trim().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
};

// Fotos reales de Wikimedia Commons guardadas en la carpeta img/ del proyecto.
// Así siempre cargan, aunque no haya conexión con la API.
// Formato: "nombre del archivo en Commons": [ruta local, autor, licencia]
const FOTOS_LOCALES = {
  "Catedral de San Ildefonso al atardecer..JPG": ["img/login-1.jpg", "Aubolio", "CC BY-SA 3.0"],
  "Catedral de San Ildefonso, Mérida, Yucatán, fachada principal.jpg": ["img/catedral-1.jpg", "Gideonximi", "CC BY 4.0"],
  "Catedral de San Ildefonso de noche.JPG": ["img/catedral-3.jpg", "", "CC BY-SA 3.0"],
  "Catedral de Mérida, Yucatán de noche.jpg": ["img/catedral-4.jpg", "", "CC BY-SA 4.0"],
  "Templo de El Jesús o de la Tercera Orden - Merida Yucatan 2012 02.jpg": ["img/jesus-1.jpg", "", ""],
  "Iglesia del Jesús (Tercera Orden) Merida 2012.jpg": ["img/jesus-2.jpg", "", ""],
  "Torre de la Iglesia de Jesús de la Tercera Orden, Mérida, Yucatán.jpg": ["img/jesus-3.jpg", "", ""],
  "Interior de Rectoría El Jesús Tercera Orden, Mérida Yucatán.jpg": ["img/jesus-4.jpg", "", ""],
  "Vista del Templo de San Cristobal (Santuario de Guadalupe), Mérida, Yucatán 01.jpg": ["img/sancristobal-1.jpg", "", "CC BY-SA 4.0"],
  "Iglesia de San Cristóbal Mérida 1.JPG": ["img/sancristobal-2.jpg", "", ""],
  "Vista del Templo de San Cristobal (Santuario de Guadalupe), Mérida, Yucatán 02.jpg": ["img/sancristobal-3.jpg", "", ""],
  "Iglesia de Nuestra Señora de Guadalupe Antes San Cristóbal, Mérida Yucatán 2022-03.jpg": ["img/sancristobal-4.jpg", "", ""],
  "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (01).JPG": ["img/santaana-1.jpg", "", "CC0"],
  "Iglesia de Santa Ana - Merida, Yucatan.jpg": ["img/santaana-2.jpg", "", ""],
  "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (02).JPG": ["img/santaana-3.jpg", "", "CC0"],
  "Iglesia del Barrio de Santa Ana, Mérida, Yucatán (03).JPG": ["img/santaana-4.jpg", "", ""],
  "Ermita de Santa Isabel, Mérida, Yucatán (08).jpg": ["img/santaisabel-1.jpg", "", "CC0"],
  "Ermita de Santa Isabel, Mérida, Yucatán (07).jpg": ["img/santaisabel-2.jpg", "", ""],
  "Ermita de Santa Isabel, Mérida, Yucatán (06).jpg": ["img/santaisabel-3.jpg", "", "CC0"],
  "Ermita de Santa Isabel, Mérida, Yucatán (05).jpg": ["img/santaisabel-4.jpg", "", ""],
  "Iglesia de Santa Lucía-2.JPG": ["img/santalucia-1.jpg", "D. Eugenia Romero Carrillo", "CC BY-SA 3.0"],
  "Iglesia de Santa Lucía-1.JPG": ["img/santalucia-2.jpg", "", "CC BY-SA 3.0"],
  "Iglesia de Santa Lucía, Mérida, Yucatán (01).jpg": ["img/santalucia-3.jpg", "", "CC0"],
  "Iglesia de Santa Lucia 1.jpg": ["img/santalucia-4.jpg", "", ""]
};

const FOTOS = {};
const normalizarArchivo = (a) => a.replace(/^File:/, "").replaceAll("_", " ").normalize();
const buscarFoto = (archivo) => FOTOS[normalizarArchivo(archivo)];

// Llenamos FOTOS con la ruta local, el crédito y el enlace a la página de cada foto
for (const [archivo, [ruta, autor, licencia]] of Object.entries(FOTOS_LOCALES)) {
  FOTOS[normalizarArchivo(archivo)] = {
    foto: ruta,
    credito: autor || "Wikimedia Commons", // si no sabemos el autor, el enlace lleva a la página de la foto
    licencia: licencia || "ver créditos",
    pagina: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(archivo.replaceAll(" ", "_"))
  };
}

/** Pone en la página la foto principal de cada templo. */
function aplicarFotos() {
  for (const t of TEMPLOS) {
    const datosFoto = buscarFoto(t.archivo);
    if (!datosFoto) continue;
    Object.assign(t, datosFoto);
    t.miniatura = datosFoto.foto;
  }
  // Precarga las fotos principales para que el cambio de iglesia sea instantáneo
  TEMPLOS.forEach((t) => { if (t.foto) new Image().src = t.foto; });
  pintarMiniaturas();
  if (!animando) pintar();
  pintarTarjetas();
  pintarInfo();
}
