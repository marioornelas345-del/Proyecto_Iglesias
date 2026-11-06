/* =========================================================
   EVENTOS
   ========================================================= */
function conectar() {
  $("siguiente").addEventListener("click", siguiente);
  $("anterior").addEventListener("click", anterior);

  // Avance automático: se detiene si la pestaña no se ve
  document.addEventListener("visibilitychange", programarAvance);

  // Miniaturas y tarjetas de barrios
  $("miniaturas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) ir(Number(b.dataset.i));
  });
  $("lista-barrios").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (!b) return;
    ir(Number(b.dataset.i));
    $("inicio").scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth" });
  });

  // Teclado: flechas izquierda/derecha (salvo si se está escribiendo)
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select") || $("app").hidden) return;
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
    if (e.key === "Escape") cerrarMenu();
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

  // Búsqueda: abre el campo y salta al templo que coincida
  const buscador = $("buscador");
  $("btn-buscar").addEventListener("click", () => {
    const abierto = buscador.classList.toggle("abierto");
    $("btn-buscar").setAttribute("aria-expanded", abierto);
    buscador.tabIndex = abierto ? 0 : -1;
    if (abierto) buscador.focus(); else buscador.value = "";
  });
  const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  buscador.addEventListener("input", () => {
    const q = normalizar(buscador.value.trim());
    if (q.length < 2) return;
    const i = TEMPLOS.findIndex((t) => normalizar(`${t.tipo} ${t.nombre} ${t.barrio}`).includes(q));
    if (i >= 0) ir(i);
  });
  buscador.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    $("inicio").scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth" });
  });

  // Pausa del carrusel
  $("pausa").addEventListener("click", () => {
    pausado = !pausado;
    $("pausa").textContent = pausado ? "▶" : "❚❚";
    $("pausa").setAttribute("aria-label", pausado ? "Reanudar el carrusel" : "Pausar el carrusel");
    programarAvance();
  });

  // Menú
  $("btn-menu").addEventListener("click", () => {
    const abierto = $("menu-panel").classList.toggle("abierto");
    $("btn-menu").setAttribute("aria-expanded", abierto);
  });
  $("menu-panel").addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });
}

function cerrarMenu() {
  $("menu-panel").classList.remove("abierto");
  $("btn-menu").setAttribute("aria-expanded", "false");
}
