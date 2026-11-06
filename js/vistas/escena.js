/* =========================================================
   VISTA · PARTES FIJAS DE LA PÁGINA
   Estrellas, marcas de la línea de tiempo, recorrido y barrios.
   Se dibujan una sola vez al abrir la página.
   ========================================================= */
function pintarEscena() {
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
  const fragmento = document.createDocumentFragment();
  for (let i = 0; i < 140; i++) {
    const e = document.createElement("span");
    e.className = "estrella";
    const tam = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1;
    e.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 62}%;width:${tam}px;height:${tam}px;opacity:${0.4 + Math.random() * 0.6};animation-delay:${(Math.random() * 3).toFixed(2)}s;animation-duration:${(2 + Math.random() * 3).toFixed(2)}s`;
    fragmento.appendChild(e);
  }
  $("cielo").appendChild(fragmento);
}

/** Abre o cierra el menú de la navbar. */
function pintarMenu(abierto) {
  $("menu-panel").classList.toggle("abierto", abierto);
  $("btn-menu").setAttribute("aria-expanded", abierto);
}

/** Abre o cierra el campo de búsqueda. */
function pintarBuscador(abierto) {
  const buscador = $("buscador");
  buscador.classList.toggle("abierto", abierto);
  $("btn-buscar").setAttribute("aria-expanded", abierto);
  buscador.tabIndex = abierto ? 0 : -1;
  if (abierto) buscador.focus(); else buscador.value = "";
}
