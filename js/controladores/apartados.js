/* =========================================================
   CONTROLADOR · APARTADOS (Libros, Arte sacro, Eventos y misas)
   Carrusel 3D, lector de PDF y ventana de detalle.
   ========================================================= */
let inicioArrastre = null; // posición X donde empezó el arrastre sobre el carrusel
let huboArrastre = false;  // evita que soltar un arrastre cuente como clic

/** Prepara las piezas del apartado y dibuja su vista. */
function abrirApartado(tipo, t) {
  estado.piezas = tipo === "libros" ? piezasDeLibros(t) : tipo === "arte" ? piezasDeArte(t) : [];
  estado.piezaActual = 0;
  pintarVista(tipo, t, estado.piezas);
}

/** Pone en el centro la tarjeta i. */
function irAPieza(i) {
  estado.piezaActual = i;
  pintarCoverflow(estado.piezas, i);
}

/** Avanza o retrocede en el carrusel. */
function pasarPieza(paso) {
  const n = estado.piezas.length;
  if (n < 2) return;
  irAPieza((estado.piezaActual + paso + n) % n);
}

function abrirDetalle() {
  pintarDetalle(estado.piezas, estado.piezaActual, TEMPLOS[estado.elegida]);
}

/** Abre o cierra el libro de la tarjeta del centro. */
function alternarLector(abrir) {
  pintarLector(abrir ? estado.piezas[estado.piezaActual] : null);
}

/** Botones, flechas y clic fuera de la ventana de detalle. */
function conectarDetalle() {
  const dialogo = $("pieza-detalle");
  dialogo.addEventListener("click", (e) => {
    if (e.target === dialogo || e.target.closest("[data-cerrar-detalle]")) dialogo.close();
    const mover = e.target.closest("[data-detalle-mover]");
    if (mover) { pasarPieza(Number(mover.dataset.detalleMover)); abrirDetalle(); }
    if (e.target.closest("[data-leer-detalle]")) { dialogo.close(); alternarLector(true); }
  });
  dialogo.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.stopPropagation();
    pasarPieza(e.key === "ArrowRight" ? 1 : -1);
    abrirDetalle();
  });
}

function conectarApartados() {
  const vista = $("vista-apartado");
  vista.addEventListener("click", (e) => {
    if (e.target.closest("[data-volver]")) volverAFicha();
    // Cambiar de apartado no agrega un paso: "Volver" siempre lleva a la ficha
    const otra = e.target.closest(".vista-otra");
    if (otra) {
      e.preventDefault();
      location.replace(otra.getAttribute("href"));
    }
    const leer = e.target.closest("[data-leer]");
    if (leer) alternarLector(leer.getAttribute("aria-expanded") !== "true");
    if (e.target.closest("[data-cerrar-lector]")) alternarLector(false);
    const mover = e.target.closest("[data-mover]");
    if (mover) pasarPieza(Number(mover.dataset.mover));
    const tarjeta = e.target.closest("[data-pieza]");
    if (tarjeta && !huboArrastre) {
      // La tarjeta del centro abre la imagen grande; las de los lados se acercan al centro
      const i = Number(tarjeta.dataset.pieza);
      if (i === estado.piezaActual) abrirDetalle();
      else irAPieza(i);
    }
    if (e.target.closest("[data-ver-detalle]")) abrirDetalle();
    huboArrastre = false;
  });
  vista.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pasarPieza(-1);
    if (e.key === "ArrowRight") pasarPieza(1);
  });
  vista.addEventListener("pointerdown", (e) => {
    huboArrastre = false;
    inicioArrastre = e.target.closest(".cover-escena") ? e.clientX : null;
  });
  vista.addEventListener("pointerup", (e) => {
    if (inicioArrastre === null) return;
    const distancia = e.clientX - inicioArrastre;
    inicioArrastre = null;
    if (Math.abs(distancia) < 40) return;
    huboArrastre = true;
    pasarPieza(distancia < 0 ? 1 : -1);
  });
  conectarDetalle();
}
