/* =========================================================
   CONTROLADOR · CARRUSEL DE LA PORTADA
   Cambia de iglesia (botones, miniaturas, teclado, dedo) y
   avanza solo cada 6 segundos.
   ========================================================= */
const INTERVALO_AVANCE = 6000;
let temporizadorAvance = null;
let pausado = false;

/** Va a la iglesia número indice con transición. */
function ir(indice, direccion) {
  const nuevo = (indice + TEMPLOS.length) % TEMPLOS.length;
  if (nuevo === estado.actual || animando) return;
  direccion = direccion || (nuevo > estado.actual ? 1 : -1);
  programarAvance(); // si el usuario cambia de templo, el contador vuelve a empezar
  animarCambio(direccion, () => {
    estado.actual = nuevo;
    pintarCarrusel(nuevo);
  });
}

const siguiente = () => ir(estado.actual + 1, 1);
const anterior = () => ir(estado.actual - 1, -1);

/** Avance automático: se detiene con la pausa, con la pestaña oculta o fuera de la app. */
function programarAvance() {
  clearTimeout(temporizadorAvance);
  if (pausado || document.hidden || $("app").hidden) return;
  temporizadorAvance = setTimeout(() => {
    siguiente(); // después de la última iglesia vuelve a la primera
    programarAvance();
  }, INTERVALO_AVANCE);
}

function detenerAvance() {
  clearTimeout(temporizadorAvance);
}

/** Lleva el carrusel a la iglesia i y sube a la portada. */
function verEnCarrusel(i) {
  ir(i);
  desplazarA($("inicio"));
}

function conectarCarrusel() {
  pintarMiniaturas(estado.actual);
  pintarCarrusel(estado.actual);

  $("siguiente").addEventListener("click", siguiente);
  $("anterior").addEventListener("click", anterior);
  document.addEventListener("visibilitychange", programarAvance);

  $("miniaturas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) ir(Number(b.dataset.i));
  });
  $("lista-barrios").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) verEnCarrusel(Number(b.dataset.i));
  });

  // Deslizar con el dedo
  let inicioX = null, inicioY = null;
  const zona = $("escenario");
  zona.addEventListener("touchstart", (e) => {
    inicioX = e.touches[0].clientX;
    inicioY = e.touches[0].clientY;
  }, { passive: true });
  zona.addEventListener("touchend", (e) => {
    if (inicioX === null) return;
    const dx = e.changedTouches[0].clientX - inicioX;
    const dy = e.changedTouches[0].clientY - inicioY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? siguiente : anterior)();
    inicioX = null;
  });

  $("pausa").addEventListener("click", () => {
    pausado = !pausado;
    pintarPausa(pausado);
    programarAvance();
  });
}
