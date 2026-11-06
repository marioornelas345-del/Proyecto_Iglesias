/* =========================================================
   CONTROLADOR · "TODAS LAS IGLESIAS" Y MAPA
   Elegir iglesia, cambiar la foto de la galería y pedir la ruta.
   ========================================================= */
let ultimaRuta = 0; // número de la última ruta pedida (para descartar respuestas viejas)

/** Vuelve a dibujar la tarjeta elegida y la ficha completa. */
function pintarIglesiaElegida() {
  pintarTarjetas(estado.elegida);
  pintarInfo(estado.elegida, estado.fotoGaleria, estado.modoRuta);
}

/** Cambia la iglesia elegida (desde una tarjeta, el mapa o una dirección #libros/...). */
function seleccionar(i, { desplazar = true, volar = true } = {}) {
  estado.elegida = i;
  estado.fotoGaleria = 0;
  pintarIglesiaElegida();
  pintarMapa(i, volar);
  ultimaRuta++; // descarta una ruta que siga en camino
  quitarRuta(); // la ruta se calcula solo al pulsar "Ver ruta"
  if (desplazar) desplazarA($("detalle"));
}

/** Crea el mapa la primera vez que la aplicación se ve. */
function iniciarMapa() {
  if (crearMapa((i) => seleccionar(i, { desplazar: false }))) pintarMapa(estado.elegida, false);
}

/** Calcula la ruta hasta la iglesia elegida y la dibuja en el mapa. */
async function calcularRuta() {
  if (!hayMapa()) return;
  const id = ++ultimaRuta;
  const destino = TEMPLOS[estado.elegida];
  quitarRuta();
  try {
    const origen = await puntoDeSalida();
    if (id !== ultimaRuta) return; // ya se pidió otra ruta mientras tanto
    const geometria = await buscarRuta(origen, destino, estado.modoRuta);
    if (id !== ultimaRuta) return;
    dibujarRuta(geometria, origen);
  } catch (error) {
    if (id === ultimaRuta) console.warn(error); // sin ruta en el mapa; no hay panel donde mostrar el error
  }
}

/** Lleva la vista al mapa (en celular el mapa está debajo de la ficha). */
function irAlMapa() {
  desplazarA(esPantallaAngosta() ? $("mapa") : $("detalle"));
}

function conectarIglesias() {
  pintarIglesiaElegida();
  pintarFichaMapa(estado.elegida);

  // Tarjeta de la iglesia sobre el mapa
  $("mapa-ficha").addEventListener("click", (e) => {
    const mover = e.target.closest("[data-ficha-mover]");
    if (mover) seleccionar((estado.elegida + Number(mover.dataset.fichaMover) + TEMPLOS.length) % TEMPLOS.length, { desplazar: false });
    if (e.target.closest("[data-ficha-ruta]")) calcularRuta();
  });

  // Tarjetas de las iglesias
  $("tarjetas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) seleccionar(Number(b.dataset.i));
  });

  // Galería y botones de la ficha completa
  $("info").addEventListener("click", (e) => {
    const miniatura = e.target.closest("[data-foto]");
    if (miniatura) {
      estado.fotoGaleria = Number(miniatura.dataset.foto);
      pintarIglesiaElegida();
    }
    const modo = e.target.closest("[data-modo]");
    if (modo) {
      estado.modoRuta = modo.dataset.modo;
      pintarIglesiaElegida();
      if (hayRuta()) calcularRuta(); // recalcula la ruta con el nuevo modo
    }
    if (e.target.closest("[data-ruta]")) {
      if (esPantallaAngosta()) irAlMapa();
      calcularRuta();
    }
    const carrusel = e.target.closest("[data-carrusel]");
    if (carrusel) verEnCarrusel(Number(carrusel.dataset.carrusel));
  });
}
