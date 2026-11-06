/* =========================================================
   VISTA · APARTADOS DE CADA IGLESIA
   Libros, Arte sacro y Eventos y misas: carrusel 3D, lector de
   PDF, ventana de detalle y horarios.
   ========================================================= */

/** Los tres apartados de cada iglesia: ruta, nombre y título de su vista. */
const APARTADOS = {
  libros: { nombre: "Libros", titulo: "<em>Libros</em>" },
  arte: { nombre: "Arte sacro", titulo: "Arte <em>sacro</em>" },
  eventos: { nombre: "Eventos y misas", titulo: "Eventos y <em>misas</em>" }
};

/** Botones de la ficha que llevan a las vistas de cada apartado. */
function htmlApartados(t) {
  return `
    <nav class="apartados" aria-label="Libros, arte sacro, eventos y misas de ${t.tipo} ${t.nombre}">
      ${Object.entries(APARTADOS).map(([tipo, a]) => `<a href="#${tipo}/${t.clave}">${a.nombre}</a>`).join("")}
    </nav>`;
}

/* ---------- Carrusel 3D ---------- */

function htmlCoverflow(piezas, t) {
  if (!piezas.length) return "";
  return `
    <div class="coverflow" role="group" aria-roledescription="carrusel" aria-label="${t.tipo} ${t.nombre}">
      <div class="cover-escena">
        ${piezas.map((p, i) => `
          <button class="cover${p.libro ? " es-libro" : ""}" type="button" data-pieza="${i}" aria-label="${p.nombre}">
            ${p.foto ? `<img src="${p.foto.foto}" alt="" draggable="false">
            <span class="cover-texto"><strong>${p.nombre}</strong><em>${p.grupo}</em></span>`
            : `<span class="cover-ilustrada"><span aria-hidden="true">✠</span><strong>${p.nombre}</strong><em>${p.grupo}</em></span>`}
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
function pintarCoverflow(piezas, actual) {
  const n = piezas.length;
  if (!n) return;
  document.querySelectorAll(".cover").forEach((c, i) => {
    let d = (i - actual + n) % n; // el carrusel da la vuelta
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

  const p = piezas[actual];
  if (n > 1) $("cover-cuenta").textContent = `${actual + 1} / ${n}`;
  $("cover-panel").innerHTML = `
    <h3>${p.nombre}${p.estado ? ` <span class="arte-perdida">${p.estado}</span>` : ""}</h3>
    <p class="cover-grupo">${p.grupo}</p>
    ${p.detalle ? `<p>${p.detalle}</p>` : ""}
    ${p.nota ? `<p class="cover-nota">${p.nota}</p>` : ""}
    <button class="boton-contorno cover-leer" type="button" data-ver-detalle>${p.libro ? "Ver portada e historia" : "Ver imagen e historia"}</button>
    ${p.digital ? `<button class="boton-contorno cover-leer" type="button" data-leer aria-expanded="false" aria-controls="lector">Leer el libro aquí${p.pagina ? `, en la página ${p.pagina}` : ""}</button>
    <div class="lector" id="lector" hidden></div>` : ""}`;
}

/* ---------- Lector de PDF ---------- */

/** PDF del libro dentro de la página, abierto en la hoja donde está el pasaje citado. */
function htmlLector(p) {
  const pdf = p.digital.pdf + (p.hoja ? `#page=${p.hoja}` : "");
  return `
    <iframe src="${pdf}" title="${p.nombre} (PDF)" allowfullscreen></iframe>
    <div class="lector-acciones">
      <a href="${pdf}" target="_blank" rel="noopener">Abrir el PDF en pantalla completa ›</a>
      <button class="boton-contorno" type="button" data-cerrar-lector>Cerrar el libro</button>
    </div>
    <small>Digitalización de <a href="${p.enLinea}" target="_blank" rel="noopener">Internet Archive</a>, dominio público. La copia está guardada en este sitio.</small>`;
}

/** Muestra el libro p (o lo cierra si p es null). */
function pintarLector(p) {
  const lector = $("lector");
  if (!lector) return;
  lector.innerHTML = p ? htmlLector(p) : "";
  lector.hidden = !p;
  document.querySelector("[data-leer]").setAttribute("aria-expanded", Boolean(p));
  if (p) desplazarA(lector);
}

/* ---------- Ventana de detalle ---------- */

/** Imagen grande a un lado y la historia de la pieza (o libro) al otro. */
function pintarDetalle(piezas, actual, t) {
  const p = piezas[actual];
  const n = piezas.length;
  $("pieza-detalle").innerHTML = `
    <button class="detalle-cerrar" type="button" data-cerrar-detalle aria-label="Cerrar">×</button>
    <figure class="detalle-imagen${p.libro ? " es-libro" : ""}">
      ${p.foto ? `<img src="${p.foto.foto}" alt="${p.fotoPropia ? p.nombre : `Fotografía de ${t.tipo} ${t.nombre}`}">`
        : `<span class="cover-ilustrada"><span aria-hidden="true">✠</span><strong>${p.nombre}</strong><em>${p.grupo}</em></span>`}
    </figure>
    <div class="detalle-texto">
      <span class="etiqueta">${t.tipo} ${t.nombre}</span>
      <h2 id="pieza-titulo">${p.nombre}</h2>
      <p class="cover-grupo">${p.grupo}${p.estado ? ` <span class="arte-perdida">${p.estado}</span>` : ""}</p>
      ${p.significado || p.creacion ? `
        ${p.detalle ? `<h3>Historia</h3><p class="detalle-historia">${p.detalle}</p>` : ""}
        ${p.significado ? `<h3>Qué significa</h3><p class="detalle-historia">${p.significado}</p>` : ""}
        ${p.creacion ? `<h3>Cómo se hizo</h3><p class="detalle-historia">${p.creacion}</p>` : ""}`
      : p.detalle ? `<p class="detalle-historia">${p.detalle}</p>` : ""}
      ${p.nota ? `<p class="cover-nota">${p.nota}</p>` : ""}
      ${p.digital ? `<button class="boton-contorno cover-leer" type="button" data-leer-detalle>Leer el libro${p.pagina ? `, en la página ${p.pagina}` : ""}</button>` : ""}
      ${n > 1 ? `<div class="cover-controles">
        <button type="button" data-detalle-mover="-1" aria-label="Anterior">‹</button>
        <span>${actual + 1} / ${n}</span>
        <button type="button" data-detalle-mover="1" aria-label="Siguiente">›</button>
      </div>` : ""}
    </div>`;
  const dialogo = $("pieza-detalle");
  if (!dialogo.open) dialogo.showModal();
}

/* ---------- Contenido de cada apartado ---------- */

function htmlLibros(t, piezas) {
  return htmlCoverflow(piezas, t);
}

function htmlArte(t, piezas) {
  return htmlCoverflow(piezas, t);
}

/** "18:30" → "6:30 p. m." */
function horaLegible(minutos) {
  const h = Math.floor(minutos / 60) % 24;
  const m = String(minutos % 60).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "a. m." : "p. m."}`;
}

/** Una misa con su hora de inicio y su término aproximado, en columnas alineadas. */
function htmlMisa([inicio, nota]) {
  const [h, m] = inicio.split(":").map(Number);
  const empieza = h * 60 + m;
  return `
    <li>
      <span class="misa-inicio">${horaLegible(empieza)}</span>
      <span class="misa-guion" aria-hidden="true">–</span><span class="sr"> a </span>
      <span class="misa-fin">${horaLegible(empieza + DURACION_MISA)}</span>
      ${nota ? `<span class="misa-nota">${nota}</span>` : ""}
    </li>`;
}

/** Horarios de misa y fiestas del templo. */
function htmlEventos(t) {
  const m = MISAS[t.clave];
  return `
    <div class="eventos">
      <section class="eventos-bloque" aria-labelledby="misas-titulo">
        <h3 id="misas-titulo">Horarios de misa</h3>
        <p class="misas-leyenda" aria-hidden="true"><span>Inicio</span><span></span><span>Término aprox.</span></p>
        <dl class="misas">
          ${m.horarios.map((h) => `<div><dt>${h.dias}</dt><dd>${h.texto || `<ul>${h.misas.map(htmlMisa).join("")}</ul>`}</dd></div>`).join("")}
        </dl>
        ${m.notaHorarios ? `<p class="eventos-nota">${m.notaHorarios}</p>` : ""}
      </section>
      <section class="eventos-bloque" aria-labelledby="fiestas-titulo">
        <h3 id="fiestas-titulo">Fiestas y eventos</h3>
        ${m.fiestas.map((f) => `
          <article class="fiesta">
            <p class="fiesta-fecha">${f.fecha}</p>
            <h4>${f.nombre}</h4>
            <p>${f.motivo}</p>
          </article>`).join("")}
        ${m.notaFiestas ? `<p class="eventos-nota">${m.notaFiestas}</p>` : ""}
      </section>
    </div>`;
}

/** Llena la vista completa de un apartado de la iglesia. */
function pintarVista(tipo, t, piezas) {
  const contenido = tipo === "libros" ? htmlLibros(t, piezas) : tipo === "arte" ? htmlArte(t, piezas) : htmlEventos(t);
  $("vista-apartado").innerHTML = `
    <button class="boton-contorno vista-volver" type="button" data-volver>‹ Volver a la iglesia</button>
    <header class="vista-encabezado">
      <h2 id="vista-titulo" tabindex="-1">${APARTADOS[tipo].titulo}</h2>
      <p>${t.tipo} ${t.nombre}</p>
      <span class="vista-adorno" aria-hidden="true"></span>
    </header>
    <div class="vista-contenido">${contenido}</div>
    <div class="vista-otras">
      ${Object.entries(APARTADOS).filter(([otro]) => otro !== tipo).map(([otro, a]) =>
        `<a class="boton-contorno vista-otra" href="#${otro}/${t.clave}">Ver ${a.nombre} <span aria-hidden="true">›</span></a>`).join("")}
    </div>`;
  pintarCoverflow(piezas, 0);
}
