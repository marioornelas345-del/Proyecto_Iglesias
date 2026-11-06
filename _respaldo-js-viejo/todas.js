/* =========================================================
   SECCIÓN "TODAS LAS IGLESIAS"
   Tarjetas arriba, información completa abajo y el mapa a un costado.
   ========================================================= */
let elegida = 0;       // iglesia que se muestra en la ficha completa
let fotoGaleria = 0;   // foto grande de la galería
let mapa = null;       // mapa de Leaflet
const marcadores = [];

let scrollFicha = 0;     // posición de la ficha antes de abrir un apartado
let vistaDesdeFicha = false; // ¿se llegó a la vista desde los botones de la ficha?
let piezasVista = [];    // tarjetas del carrusel de Libros o Arte sacro
let piezaActual = 0;     // tarjeta del centro
let inicioArrastre = null; // posición X donde empezó el arrastre sobre el carrusel
let huboArrastre = false;  // evita que soltar un arrastre cuente como clic
let modoRuta = "pie";  // "pie" o "auto"
let capaRuta = null;   // línea de la ruta en el mapa
let ubicacionUsuario;  // undefined = aún no se pregunta; null = sin permiso
let ultimaRuta = 0;    // número de la última ruta pedida (para descartar respuestas viejas)

/** Distancia en km entre dos puntos (fórmula de Haversine). */
function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Tarjetas de todas las iglesias. */
function pintarTarjetas() {
  $("tarjetas").innerHTML = TEMPLOS.map((t, i) => `
    <button class="tarjeta${i === elegida ? " activa" : ""}" type="button" data-i="${i}" aria-pressed="${i === elegida}">
      <span class="tarjeta-foto">${t.foto ? `<img src="${t.foto}" alt="" loading="lazy">` : svgFachada(t.clave, "")}</span>
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
  const distancia = elegida === 0 ? "" : ` y está a <strong>${distanciaKm(TEMPLOS[0], t).toFixed(1)} km de la Catedral</strong>`;

  return `${articulo} <strong>${t.tipo} ${t.nombre}</strong> ${construccion}, con un estilo <strong>${estilo}</strong>. ` +
    `Se encuentra ${lugar}, sobre la <strong>${calle}</strong>${distancia}. ` +
    `Tiene ${t.aproximado ? "cerca de " : ""}<strong>${anios} años</strong> de historia. ` +
    `${t.descripcion} ` +
    `Sus coordenadas son ${t.lat.toFixed(5)}, ${t.lon.toFixed(5)}.`;
}

/** Libros de la iglesia como tarjetas del carrusel. */
function piezasLibros(p) {
  return p.libros.map((l) => ({
    nombre: l.titulo,
    grupo: l.fecha,
    detalle: l.detalle || "",
    nota: l.lugar ? `Se conserva en: ${l.lugar}` : "",
    aviso: "este libro"
  }));
}

/** Piezas de arte sacro como tarjetas del carrusel, en el orden de las categorías. */
function piezasArte(p) {
  return CATEGORIAS_ARTE.flatMap((c) => (p.arte[c.clave] || []).map((o) => ({
    nombre: o.nombre,
    grupo: c.nombre,
    detalle: o.detalle,
    nota: c.definicion,
    perdida: o.perdida,
    aviso: "esta pieza"
  })));
}

/** Carrusel 3D. No hay fotos de las piezas: cada tarjeta usa una foto del templo. */
function htmlCoverflow(piezas, t) {
  const fotos = t.galeria.map(buscarFoto).filter(Boolean);
  piezas.forEach((p, i) => { p.foto = fotos[i % fotos.length]; });
  piezasVista = piezas;
  piezaActual = 0;
  if (!piezas.length) return "";

  return `
    <div class="coverflow" role="group" aria-roledescription="carrusel" aria-label="${t.tipo} ${t.nombre}">
      <div class="cover-escena">
        ${piezas.map((p, i) => `
          <button class="cover" type="button" data-pieza="${i}" aria-label="${p.nombre}">
            ${p.foto ? `<img src="${p.foto.foto}" alt="" draggable="false">` : ""}
            <span class="cover-texto"><strong>${p.nombre}</strong><em>${p.grupo}</em></span>
          </button>`).join("")}
      </div>
      ${piezas.length > 1 ? `<div class="cover-controles">
        <button type="button" data-mover="-1" aria-label="Anterior">‹</button>
        <span id="cover-cuenta"></span>
        <button type="button" data-mover="1" aria-label="Siguiente">›</button>
      </div>` : ""}
    </div>
    <div class="cover-panel" id="cover-panel" aria-live="polite"></div>`;
}

/** Acomoda las tarjetas alrededor de la actual y muestra sus datos debajo. */
function moverCoverflow() {
  const n = piezasVista.length;
  if (!n) return;
  document.querySelectorAll(".cover").forEach((c, i) => {
    let d = (i - piezaActual + n) % n; // el carrusel da la vuelta
    if (d > n / 2) d -= n;
    const a = Math.abs(d);
    const lado = Math.sign(d);
    const x = lado * (a === 0 ? 0 : 68 + (Math.min(a, 3) - 1) * 67);
    c.style.transform = `translateX(${x}%) scale(${a ? 0.8 : 1}) rotateY(${-lado * 32}deg)`;
    c.style.zIndex = 10 - a;
    c.classList.toggle("activa", d === 0);
    c.classList.toggle("oculta", a > 2);
    c.tabIndex = d === 0 ? 0 : -1;
  });

  const p = piezasVista[piezaActual];
  if (n > 1) $("cover-cuenta").textContent = `${piezaActual + 1} / ${n}`;
  $("cover-panel").innerHTML = `
    <h3>${p.nombre}${p.perdida ? ` <span class="arte-perdida">Perdido</span>` : ""}</h3>
    <p class="cover-grupo">${p.grupo}</p>
    ${p.detalle ? `<p>${p.detalle}</p>` : ""}
    ${p.nota ? `<p class="cover-nota">${p.nota}</p>` : ""}
    ${p.foto ? `<small>La foto muestra el templo, no ${p.aviso}. Foto: ${p.foto.credito} · <a href="${p.foto.pagina}" target="_blank" rel="noopener">${p.foto.licencia}</a></small>` : ""}`;
}

/** Avanza o retrocede en el carrusel. */
function pasarPieza(paso) {
  const n = piezasVista.length;
  if (n < 2) return;
  piezaActual = (piezaActual + paso + n) % n;
  moverCoverflow();
}

/** Libros: carrusel y aviso de la iglesia. */
function htmlLibros(p, t) {
  return `
    ${htmlCoverflow(piezasLibros(p), t)}
    ${p.notaLibros ? `<p class="apartado-nota">${p.notaLibros}</p>` : ""}`;
}

/** Arte sacro: carrusel y categorías sin piezas confirmadas en la iglesia. */
function htmlArte(p, t) {
  const sinPiezas = CATEGORIAS_ARTE.filter((c) => !p.arte[c.clave]);
  const vacias = sinPiezas.map((c) => `<li><strong>${c.nombre}:</strong> ${c.definicion}</li>`).join("");

  return `
    ${htmlCoverflow(piezasArte(p), t)}
    ${vacias ? `<details class="arte-vacias">
      <summary>Categorías sin piezas confirmadas en este templo (${sinPiezas.length})</summary>
      <ul>${vacias}</ul>
    </details>` : ""}`;
}

/** Botones de la ficha que llevan a las vistas "Libros" y "Arte sacro". */
function htmlApartados(t) {
  return `
    <nav class="apartados" aria-label="Libros y arte sacro de ${t.tipo} ${t.nombre}">
      <a href="#libros/${t.clave}">Libros</a>
      <a href="#arte/${t.clave}">Arte sacro</a>
    </nav>`;
}

/** Llena la vista completa de un apartado de la iglesia. */
function pintarVista(tipo, t) {
  const p = PATRIMONIO[t.clave];
  const esLibros = tipo === "libros";
  $("vista-apartado").innerHTML = `
    <button class="boton-contorno vista-volver" type="button" data-volver>‹ Volver a la iglesia</button>
    <header class="vista-encabezado">
      <h2 id="vista-titulo" tabindex="-1">${esLibros ? "<em>Libros</em>" : "Arte <em>sacro</em>"}</h2>
      <p>${t.tipo} ${t.nombre}</p>
      <span class="vista-adorno" aria-hidden="true"></span>
    </header>
    <div class="vista-contenido">${esLibros ? htmlLibros(p, t) : htmlArte(p, t)}</div>
    <p class="apartados-fuentes">Lista de lo que pudimos confirmar; no es un inventario completo. Fuentes:
      ${p.fuentes.map((f) => `<a href="${f.url}" target="_blank" rel="noopener">${f.nombre}</a>`).join(" · ")}
    </p>
    <a class="boton-contorno vista-otra" href="#${esLibros ? "arte" : "libros"}/${t.clave}">Ver ${esLibros ? "Arte sacro" : "Libros"} <span aria-hidden="true">›</span></a>`;
  moverCoverflow();
}

/** Muestra la vista que pide la dirección (#libros/catedral, #perfil) o regresa a la página. */
function actualizarVista() {
  const ruta = location.hash.match(/^#(libros|arte)\/(\w+)$/);
  const t = ruta && TEMPLOS.find((x) => x.clave === ruta[2]);
  const enPerfil = location.hash === "#perfil";
  const main = document.querySelector("main");

  $("vista-apartado").hidden = !t;
  $("vista-perfil").hidden = !enPerfil;

  if (t || enPerfil) {
    if (!main.hidden) {
      scrollFicha = window.scrollY;
      vistaDesdeFicha = true;
    }
    main.hidden = true;
    if (t) {
      const i = TEMPLOS.indexOf(t);
      if (i !== elegida) { elegida = i; pintarTarjetas(); pintarInfo(); actualizarMapa(false); }
      pintarVista(ruta[1], t);
    } else {
      pintarPerfil();
    }
    window.scrollTo(0, 0);
    $(t ? "vista-titulo" : "perfil-titulo").focus({ preventScroll: true });
    return;
  }

  if (main.hidden) {
    main.hidden = false;
    if (mapa) mapa.invalidateSize();
    // El navegador no pudo bajar al destino mientras estaba oculto
    const destino = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (destino) destino.scrollIntoView({ behavior: "auto" });
    else window.scrollTo(0, scrollFicha);
    vistaDesdeFicha = false;
  }
}

/** Regresa a la ficha de la iglesia desde la vista completa. */
function volverAFicha() {
  if (vistaDesdeFicha) history.back();
  else location.hash = "#detalle"; // se abrió directo con el enlace
}

/** Ficha completa de la iglesia elegida: galería, textos, datos y enlaces. */
function pintarInfo() {
  const t = TEMPLOS[elegida];
  const fotos = t.galeria.map(buscarFoto).filter(Boolean);
  const actual = fotos[fotoGaleria] || fotos[0];
  const parrafo = parrafoInformacion(t);

  $("info").innerHTML = `
    <header class="info-encabezado">
      <span class="etiqueta">${t.barrio}</span>
      <h3 class="titulo"><b>${t.tipo}</b><span>${t.nombre}</span></h3>
      <p class="subtitulo">${t.subtitulo}</p>
    </header>

    <figure class="galeria">
      <div class="galeria-principal">
        ${actual ? `<img src="${actual.foto}" alt="Fotografía de ${t.tipo} ${t.nombre}">` : svgFachada(t.clave, `Ilustración de ${t.tipo} ${t.nombre}`)}
      </div>
      ${actual ? `<figcaption>Foto: ${actual.credito} · <a href="${actual.pagina}" target="_blank" rel="noopener">${actual.licencia}</a></figcaption>` : ""}
      ${fotos.length > 1 ? `<div class="galeria-miniaturas">
        ${fotos.map((f, i) => `<button type="button" class="${f === actual ? "activa" : ""}" data-foto="${i}" aria-label="Ver foto ${i + 1} de ${fotos.length}"><img src="${f.foto}" alt="" loading="lazy"></button>`).join("")}
      </div>` : ""}
    </figure>

    <p class="info-texto">${parrafo}</p>

    <div class="info-acciones">
      <div class="modo-ruta" role="group" aria-label="¿Cómo quieres ir?">
        <button type="button" data-modo="pie" aria-pressed="${modoRuta === "pie"}">A pie</button>
        <button type="button" data-modo="auto" aria-pressed="${modoRuta === "auto"}">En auto</button>
      </div>
      <button class="boton" type="button" data-ruta>VER RUTA <span aria-hidden="true">→</span></button>
      <button class="boton-contorno" type="button" data-carrusel="${elegida}">Ver en el carrusel</button>
    </div>

    ${htmlApartados(t)}`;
}

/** Cambia la iglesia elegida (desde una tarjeta o un marcador del mapa). */
function seleccionar(i, desdeMapa = false) {
  elegida = i;
  fotoGaleria = 0;
  pintarTarjetas();
  pintarInfo();
  actualizarMapa(true);
  ultimaRuta++; // descarta una ruta que siga en camino
  quitarRuta(); // la ruta se calcula solo al pulsar "Ver ruta"
  if (!desdeMapa) {
    $("detalle").scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block: "start" });
  }
}

/** Crea el mapa (una sola vez) con un marcador numerado por iglesia. */
function iniciarMapa() {
  if (typeof L === "undefined") return; // sin internet no carga Leaflet
  if (mapa) { mapa.invalidateSize(); return; }
  mapa = L.map("mapa", { scrollWheelZoom: false });
  // Mapa de calles de Esri (funciona también al abrir el archivo con doble clic);
  // el CSS lo oscurece para que combine con la escena nocturna
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    maxNativeZoom: 17,
    attribution: 'Mapa &copy; <a href="https://www.esri.com">Esri</a> y sus proveedores'
  }).addTo(mapa);

  TEMPLOS.forEach((t, i) => {
    const marcador = L.marker([t.lat, t.lon], {
      icon: L.divIcon({ className: "", html: `<span class="pin">${i + 1}</span>`, iconSize: [30, 44], iconAnchor: [15, 44] }),
      title: `${t.tipo} ${t.nombre}`
    })
      .bindTooltip(`${t.tipo} ${t.nombre} · ${t.anio}`, { direction: "top", offset: [0, -16] })
      .on("click", () => seleccionar(i, true))
      .addTo(mapa);
    marcadores.push(marcador);
  });

  // Encuadre inicial con todas las iglesias
  mapa.fitBounds(L.latLngBounds(TEMPLOS.map((t) => [t.lat, t.lon])), { padding: [40, 40] });
  actualizarMapa(false);
}

/** Resalta el marcador de la iglesia elegida y, si se pide, vuela hasta ella. */
function actualizarMapa(volar) {
  if (!mapa) return;
  marcadores.forEach((m, i) => {
    m.getElement()?.querySelector(".pin")?.classList.toggle("activo", i === elegida);
    m.setZIndexOffset(i === elegida ? 1000 : 0);
  });
  if (volar) {
    const t = TEMPLOS[elegida];
    if (reducirMovimiento) mapa.setView([t.lat, t.lon], 16);
    else mapa.flyTo([t.lat, t.lon], 16, { duration: 1.2 });
  }
}

/* ---------------------------------------------------------
   RUTA DENTRO DE LA APP
   Usa tu ubicación (si das permiso) y el servicio de rutas de OpenStreetMap
   para dibujar el camino en el mapa, con distancia, tiempo e indicaciones.
   --------------------------------------------------------- */
const SERVIDOR_RUTAS = {
  pie: "https://routing.openstreetmap.de/routed-foot/route/v1/foot/",
  auto: "https://routing.openstreetmap.de/routed-car/route/v1/driving/"
};
const PLAZA_GRANDE = { lat: 20.96695, lon: -89.62375 }; // punto de salida si no hay ubicación

/** Pide la ubicación del usuario. Devuelve null si no da permiso o no se puede. */
function obtenerUbicacion() {
  return new Promise((resolver) => {
    if (!navigator.geolocation) return resolver(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolver({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolver(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

/** Calcula la ruta hasta la iglesia elegida y la dibuja en el mapa. */
async function calcularRuta() {
  if (!mapa) return;
  const id = ++ultimaRuta;
  const t = TEMPLOS[elegida];
  quitarRuta();

  // 1) Punto de salida: tu ubicación (se pide una sola vez), o la Plaza Grande si no hay permiso o estás lejos de Mérida
  if (ubicacionUsuario === undefined) ubicacionUsuario = await obtenerUbicacion();
  if (id !== ultimaRuta) return; // ya se pidió otra ruta mientras tanto
  let origen = ubicacionUsuario;
  let desdePlaza = false;
  if (!origen || distanciaKm(origen, PLAZA_GRANDE) > 25) {
    origen = PLAZA_GRANDE;
    desdePlaza = true;
  }

  // 2) Pedimos la ruta al servicio de OpenStreetMap (OSRM)
  try {
    const url = `${SERVIDOR_RUTAS[modoRuta]}${origen.lon},${origen.lat};${t.lon},${t.lat}?overview=full&geometries=geojson`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("El servicio de rutas respondió " + respuesta.status);
    const datos = await respuesta.json();
    if (id !== ultimaRuta) return;
    const ruta = datos.routes?.[0];
    if (!ruta) throw new Error("No se encontró una ruta");

    // 3) Dibujamos el camino (con un borde claro para que se vea sobre las calles) y un punto en la salida
    const borde = L.geoJSON(ruta.geometry, { style: { color: "#0b0f1a", weight: 10, opacity: 0.6, lineCap: "round", lineJoin: "round" } });
    const linea = L.geoJSON(ruta.geometry, { style: { color: "#E9A23B", weight: 6, opacity: 1, lineCap: "round", lineJoin: "round", className: "ruta-linea" } });
    const flujo = L.geoJSON(ruta.geometry, { interactive: false, style: { color: "#FFF4DC", weight: 2, opacity: 0.9, dashArray: "2 14", lineCap: "round", className: "ruta-flujo" } });
    const origenIcono = L.marker([origen.lat, origen.lon], {
      icon: L.divIcon({ className: "", html: `<span class="origen"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
      title: desdePlaza ? "Plaza Grande" : "Tú estás aquí"
    }).bindTooltip(desdePlaza ? "Plaza Grande" : "Tú estás aquí", { direction: "top", offset: [0, -12] });
    capaRuta = L.layerGroup([borde, linea, flujo, origenIcono]).addTo(mapa);
    mapa.fitBounds(linea.getBounds(), { padding: [50, 50] });
  } catch (error) {
    if (id !== ultimaRuta) return;
    console.warn(error); // sin ruta en el mapa; no hay panel que mostrar el error
  }
}

/** Borra la ruta del mapa. */
function quitarRuta() {
  if (capaRuta) {
    capaRuta.remove();
    capaRuta = null;
  }
}

/** Lleva la vista al mapa (en celular el mapa está debajo de la ficha). */
function irAlMapa() {
  const destino = window.matchMedia("(max-width: 900px)").matches ? $("mapa") : $("detalle");
  destino.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block: "start" });
}

function construir() {
  pintarMiniaturas();
  pintarTarjetas();
  pintarInfo();

  // Tarjetas, galería y botones de la ficha completa
  $("tarjetas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) seleccionar(Number(b.dataset.i));
  });
  $("info").addEventListener("click", (e) => {
    const miniatura = e.target.closest("[data-foto]");
    if (miniatura) {
      fotoGaleria = Number(miniatura.dataset.foto);
      pintarInfo();
    }
    const modo = e.target.closest("[data-modo]");
    if (modo) {
      modoRuta = modo.dataset.modo;
      pintarInfo();
      if (capaRuta) calcularRuta(); // recalcula la ruta con el nuevo modo
    }
    if (e.target.closest("[data-ruta]")) {
      if (window.matchMedia("(max-width: 900px)").matches) irAlMapa();
      calcularRuta();
    }
    const carrusel = e.target.closest("[data-carrusel]");
    if (carrusel) {
      ir(Number(carrusel.dataset.carrusel));
      $("inicio").scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth" });
    }
  });

  // Vistas de "Libros" y "Arte sacro"
  $("vista-apartado").addEventListener("click", (e) => {
    if (e.target.closest("[data-volver]")) volverAFicha();
    // Cambiar de apartado no agrega un paso: "Volver" siempre lleva a la ficha
    const otra = e.target.closest(".vista-otra");
    if (otra) {
      e.preventDefault();
      location.replace(otra.getAttribute("href"));
    }
    const mover = e.target.closest("[data-mover]");
    if (mover) pasarPieza(Number(mover.dataset.mover));
    const tarjeta = e.target.closest("[data-pieza]");
    if (tarjeta && !huboArrastre) {
      piezaActual = Number(tarjeta.dataset.pieza);
      moverCoverflow();
    }
    huboArrastre = false;
  });
  $("vista-apartado").addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pasarPieza(-1);
    if (e.key === "ArrowRight") pasarPieza(1);
  });
  $("vista-apartado").addEventListener("pointerdown", (e) => {
    huboArrastre = false;
    inicioArrastre = e.target.closest(".cover-escena") ? e.clientX : null;
  });
  $("vista-apartado").addEventListener("pointerup", (e) => {
    if (inicioArrastre === null) return;
    const distancia = e.clientX - inicioArrastre;
    inicioArrastre = null;
    if (Math.abs(distancia) < 40) return;
    huboArrastre = true;
    pasarPieza(distancia < 0 ? 1 : -1);
  });
  window.addEventListener("hashchange", actualizarVista);
  actualizarVista();
  vistaDesdeFicha = false; // abierta directo con el enlace: "Volver" no debe salir de la página

  // Marcas de cada templo en la línea de tiempo
  const pista = $("linea-pista");
  TEMPLOS.forEach((t) => {
    const marca = document.createElement("span");
    marca.className = "linea-marca";
    marca.style.left = ((t.inicio - AÑO_INICIAL) / (AÑO_FINAL - AÑO_INICIAL)) * 100 + "%";
    pista.insertBefore(marca, $("linea-punto"));
  });

  // Recorrido y barrios
  $("lista-recorrido").innerHTML = TEMPLOS.map((t) => `
    <li><strong>${t.tipo} ${t.nombre}</strong><span>${t.construccion}</span></li>`).join("");
  $("lista-barrios").innerHTML = TEMPLOS.map((t, i) => `
    <button class="barrio" type="button" data-i="${i}"><span>${t.barrio}</span><strong>${t.tipo} ${t.nombre}</strong></button>`).join("");

  // Estrellas
  const cielo = $("cielo");
  const fragmento = document.createDocumentFragment();
  for (let i = 0; i < 140; i++) {
    const e = document.createElement("span");
    e.className = "estrella";
    const tam = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1;
    e.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 62}%;width:${tam}px;height:${tam}px;opacity:${0.4 + Math.random() * 0.6};animation-delay:${(Math.random() * 3).toFixed(2)}s;animation-duration:${(2 + Math.random() * 3).toFixed(2)}s`;
    fragmento.appendChild(e);
  }
  cielo.appendChild(fragmento);
}
