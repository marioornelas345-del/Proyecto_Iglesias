/* =========================================================
   VISTA · "TODAS LAS IGLESIAS"
   Tarjetas de las iglesias y ficha completa de la elegida.
   ========================================================= */
const ICONO_UBICACION = `<svg class="icono-ubicacion" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;

/** Tarjetas de todas las iglesias; la elegida queda marcada. */
function pintarTarjetas(elegida) {
  $("tarjetas").innerHTML = TEMPLOS.map((t, i) => `
    <button class="tarjeta${i === elegida ? " activa" : ""}" type="button" data-i="${i}" aria-pressed="${i === elegida}">
      <span class="tarjeta-foto">${t.foto ? `<img src="${t.miniatura}" alt="" loading="lazy" decoding="async">` : svgFachada(t.clave, "")}</span>
      <span class="tarjeta-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="tarjeta-texto">
        <small>${t.barrio}</small>
        <strong>${t.tipo} ${t.nombre}</strong>
        <em>${t.anio}</em>
      </span>
    </button>`).join("");
}

/**
 * Arma un párrafo con toda la información de la iglesia
 * (construcción, siglo, estilo, barrio, dirección, antigüedad, distancia y coordenadas).
 * Lo más importante va dentro de <strong>, que el CSS muestra subrayado en ocre.
 */
function parrafoInformacion(t) {
  const articulo = t.tipo.startsWith("Templo") ? "El" : "La";
  const anios = new Date().getFullYear() - t.inicio;

  // Cuándo se construyó
  let construccion;
  if (t.aproximado) construccion = `se construyó en el <strong>siglo ${t.siglo}</strong>`;
  else if (t.inicio !== t.fin) construccion = `se construyó entre <strong>${t.inicio} y ${t.fin}</strong>, en el siglo ${t.siglo}`;
  else construccion = `se construyó en <strong>${t.inicio}</strong>, en el siglo ${t.siglo}`;

  // Estilo en minúsculas y sin el siglo entre paréntesis
  const estilo = t.estilo.replace(/\s*\(.*\)/, "").toLowerCase();

  // Dónde está
  let lugar;
  if (t.barrio.startsWith("Barrio de ")) lugar = "en el barrio de " + t.barrio.slice("Barrio de ".length);
  else if (t.barrio.startsWith("Centro")) lugar = "en el Centro Histórico";
  else lugar = `junto al ${t.barrio}`;
  const calle = t.direccion.split(",")[0];

  // Distancia a la Catedral (no aplica a la propia Catedral)
  const distancia = t === TEMPLOS[0] ? "" : ` y está a <strong>${distanciaKm(TEMPLOS[0], t).toFixed(1)} km de la Catedral</strong>`;

  return `${articulo} <strong>${t.tipo} ${t.nombre}</strong> ${construccion}, con un estilo <strong>${estilo}</strong>. ` +
    `Se encuentra ${lugar}, sobre la <strong>${calle}</strong>${distancia}. ` +
    `Tiene ${t.aproximado ? "cerca de " : ""}<strong>${anios} años</strong> de historia. ` +
    `${t.descripcion} ` +
    `Sus coordenadas son ${t.lat.toFixed(5)}, ${t.lon.toFixed(5)}.`;
}

/** Ficha completa de la iglesia número i: galería, textos, datos y enlaces. */
function pintarInfo(i, fotoGaleria, modoRuta) {
  const t = TEMPLOS[i];
  const fotos = t.galeria.map(buscarFoto).filter(Boolean);
  const actual = fotos[fotoGaleria] || fotos[0];

  $("info").innerHTML = `
    <header class="info-encabezado">
      <span class="etiqueta">${t.barrio}</span>
      <h3 class="titulo"><b>${t.tipo}</b><span>${t.nombre}</span></h3>
      <p class="subtitulo">${t.subtitulo}</p>
      <p class="info-direccion">${ICONO_UBICACION}<span><strong>${t.direccion}</strong> · Mérida, Yucatán</span></p>
    </header>

    <figure class="galeria">
      <div class="galeria-principal">
        ${actual ? `<img src="${actual.foto}" alt="Fotografía de ${t.tipo} ${t.nombre}">` : svgFachada(t.clave, `Ilustración de ${t.tipo} ${t.nombre}`)}
      </div>
      ${actual ? `<figcaption>Foto: ${actual.credito} · <a href="${actual.pagina}" target="_blank" rel="noopener">${actual.licencia}</a></figcaption>` : ""}
      ${fotos.length > 1 ? `<div class="galeria-miniaturas">
        ${fotos.map((f, j) => `<button type="button" class="${f === actual ? "activa" : ""}" data-foto="${j}" aria-label="Ver foto ${j + 1} de ${fotos.length}"><img src="${f.mini}" alt="" loading="lazy" decoding="async"></button>`).join("")}
      </div>` : ""}
    </figure>

    <p class="info-texto">${parrafoInformacion(t)}</p>

    <div class="info-acciones">
      <div class="modo-ruta" role="group" aria-label="¿Cómo quieres ir?">
        <button type="button" data-modo="pie" aria-pressed="${modoRuta === "pie"}">A pie</button>
        <button type="button" data-modo="auto" aria-pressed="${modoRuta === "auto"}">En auto</button>
      </div>
      <button class="boton" type="button" data-ruta>VER RUTA <span aria-hidden="true">→</span></button>
      <button class="boton-contorno" type="button" data-carrusel="${i}">Ver en el carrusel</button>
    </div>

    ${htmlApartados(t)}`;
}
