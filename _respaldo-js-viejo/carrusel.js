/* =========================================================
   ESTADO Y ELEMENTOS
   ========================================================= */
const $ = (id) => document.getElementById(id);
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let actual = 0;
let animando = false;

/* =========================================================
   PINTAR EL TEMPLO ACTUAL
   ========================================================= */
function pintar() {
  const t = TEMPLOS[actual];
  $("barrio").textContent = t.barrio;
  $("titulo").innerHTML = `<b>${t.tipo}</b><span>${t.nombre}</span>`;
  $("subtitulo").textContent = t.subtitulo;
  $("descripcion").textContent = t.descripcion;
  $("anio").textContent = t.anio;
  $("nota").textContent = t.nota;
  // Foto real si ya llegó de la API; si no, la ilustración SVG como respaldo
  $("fachada").innerHTML = t.foto
    ? `<figure class="foto">
         <div class="foto-marco"><img src="${t.foto}" alt="Fotografía de la fachada de ${t.tipo} ${t.nombre}"></div>
         <figcaption>Foto: ${t.credito} · <a href="${t.pagina}" target="_blank" rel="noopener">${t.licencia}</a></figcaption>
       </figure>`
    : svgFachada(t.clave, `Ilustración de la fachada de ${t.tipo} ${t.nombre}`);
  $("f-construccion").textContent = t.construccion;
  $("f-estilo").textContent = t.estilo;
  $("f-siglo").textContent = "Siglo " + t.siglo;
  $("f-dato").textContent = t.dato;

  const dos = (n) => String(n).padStart(2, "0");
  $("contador").innerHTML = `<b>${dos(actual + 1)}</b> / ${dos(TEMPLOS.length)}`;

  // Miniaturas
  document.querySelectorAll(".miniatura").forEach((m, i) => {
    m.classList.toggle("activa", i === actual);
    m.setAttribute("aria-current", i === actual ? "true" : "false");
  });
  const activa = document.querySelector(".miniatura.activa");
  const lista = $("miniaturas");
  if (activa && lista.scrollWidth > lista.clientWidth) {
    lista.scrollTo({ left: activa.parentElement.offsetLeft - lista.clientWidth / 2 + activa.offsetWidth / 2, behavior: reducirMovimiento ? "auto" : "smooth" });
  }

  // Línea de tiempo: el relleno llega al fin de la construcción y el punto marca el inicio
  const pos = (anio) => ((anio - AÑO_INICIAL) / (AÑO_FINAL - AÑO_INICIAL)) * 100;
  $("linea-relleno").style.width = pos(t.fin) + "%";
  $("linea-punto").style.left = pos(t.inicio) + "%";
}

/* =========================================================
   CAMBIAR DE TEMPLO CON TRANSICIÓN
   ========================================================= */
function ir(indice, direccion) {
  const nuevo = (indice + TEMPLOS.length) % TEMPLOS.length;
  if (nuevo === actual || animando) return;
  direccion = direccion || (nuevo > actual ? 1 : -1);
  programarAvance(); // si el usuario cambia de templo, el contador vuelve a empezar

  if (reducirMovimiento) {
    actual = nuevo;
    pintar();
    return;
  }

  animando = true;
  const escenario = $("escenario");
  escenario.style.setProperty("--dir", direccion);
  escenario.classList.add("saliendo");

  setTimeout(() => {
    actual = nuevo;
    pintar();
    escenario.classList.remove("saliendo");
    escenario.classList.add("entrando");
    void escenario.offsetWidth; // fuerza al navegador a aplicar la posición de entrada
    escenario.classList.remove("entrando");
    setTimeout(() => { animando = false; }, 450);
  }, 320);
}

const siguiente = () => ir(actual + 1, 1);
const anterior = () => ir(actual - 1, -1);

/* =========================================================
   AVANCE AUTOMÁTICO DEL CARRUSEL
   Cambia de templo cada 6 segundos. Se detiene con el botón de
   pausa o cuando la pestaña no se ve.
   ========================================================= */
const INTERVALO_AVANCE = 6000;
let temporizadorAvance = null;
let pausado = false;

function programarAvance() {
  clearTimeout(temporizadorAvance);
  if (pausado || document.hidden || $("app").hidden) return;
  temporizadorAvance = setTimeout(() => {
    siguiente();         // después de la última iglesia vuelve a la primera
    programarAvance();
  }, INTERVALO_AVANCE);
}

/* =========================================================
   CONSTRUIR LAS PARTES QUE DEPENDEN DE LOS DATOS
   ========================================================= */
function pintarMiniaturas() {
  $("miniaturas").innerHTML = TEMPLOS.map((t, i) => `
    <li><button class="miniatura${i === actual ? " activa" : ""}" type="button" data-i="${i}" aria-label="${t.tipo} ${t.nombre}, ${t.anio}">
      ${t.miniatura ? `<img src="${t.miniatura}" alt="">` : svgFachada(t.clave, "")}
      <span>${t.corto}</span><small>${t.anio}</small>
    </button></li>`).join("");
}
