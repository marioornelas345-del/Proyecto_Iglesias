/* =========================================================
   CONTROLADOR · NAVBAR, BÚSQUEDA Y TECLADO
   ========================================================= */
const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const cerrarMenu = () => pintarMenu(false);

function conectarNavegacion() {
  // Teclado: flechas izquierda/derecha (salvo si se está escribiendo)
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select") || $("app").hidden) return;
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
    if (e.key === "Escape") cerrarMenu();
  });

  // Búsqueda: abre el campo y salta al templo que coincida
  const buscador = $("buscador");
  $("btn-buscar").addEventListener("click", () => pintarBuscador(!buscador.classList.contains("abierto")));
  buscador.addEventListener("input", () => {
    const q = normalizar(buscador.value.trim());
    if (q.length < 2) return;
    const i = TEMPLOS.findIndex((t) => normalizar(`${t.tipo} ${t.nombre} ${t.barrio}`).includes(q));
    if (i >= 0) ir(i);
  });
  buscador.addEventListener("keydown", (e) => {
    if (e.key === "Enter") desplazarA($("inicio"));
  });

  // Menú
  $("btn-menu").addEventListener("click", () => pintarMenu(!$("menu-panel").classList.contains("abierto")));
  $("menu-panel").addEventListener("click", (e) => { if (e.target.closest("a")) cerrarMenu(); });
}
