/* =========================================================
   VISTA · CARRUSEL DE LA PORTADA
   Solo dibuja: recibe qué iglesia mostrar.
   ========================================================= */
let animando = false; // hay una transición en curso

/** Llena el escenario con la iglesia número i. */
function pintarCarrusel(i) {
  const t = TEMPLOS[i];
  $("barrio").textContent = t.barrio;
  $("titulo").innerHTML = `<b>${t.tipo}</b><span>${t.nombre}</span>`;
  $("subtitulo").textContent = t.subtitulo;
  $("descripcion").textContent = t.descripcion;
  $("anio").textContent = t.anio;
  $("nota").textContent = t.nota;
  // Foto real si la hay; si no, la ilustración SVG como respaldo
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
  $("contador").innerHTML = `<b>${dos(i + 1)}</b> / ${dos(TEMPLOS.length)}`;

  // Miniaturas
  document.querySelectorAll(".miniatura").forEach((m, j) => {
    m.classList.toggle("activa", j === i);
    m.setAttribute("aria-current", j === i ? "true" : "false");
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

/** Transición de salida y entrada; a la mitad llama a cambiar() para pintar la nueva iglesia. */
function animarCambio(direccion, cambiar) {
  if (reducirMovimiento) return cambiar();
  animando = true;
  const escenario = $("escenario");
  escenario.style.setProperty("--dir", direccion);
  escenario.classList.add("saliendo");

  setTimeout(() => {
    cambiar();
    escenario.classList.remove("saliendo");
    escenario.classList.add("entrando");
    void escenario.offsetWidth; // fuerza al navegador a aplicar la posición de entrada
    escenario.classList.remove("entrando");
    setTimeout(() => { animando = false; }, 450);
  }, 320);
}

/** Botones con la miniatura de cada iglesia. */
function pintarMiniaturas(i) {
  $("miniaturas").innerHTML = TEMPLOS.map((t, j) => `
    <li><button class="miniatura${j === i ? " activa" : ""}" type="button" data-i="${j}" aria-label="${t.tipo} ${t.nombre}, ${t.anio}">
      ${t.miniatura ? `<img src="${t.miniatura}" alt="">` : svgFachada(t.clave, "")}
      <span>${t.corto}</span><small>${t.anio}</small>
    </button></li>`).join("");
}

/** Botón de pausa del avance automático. */
function pintarPausa(pausado) {
  $("pausa").textContent = pausado ? "▶" : "❚❚";
  $("pausa").setAttribute("aria-label", pausado ? "Reanudar el carrusel" : "Pausar el carrusel");
}
