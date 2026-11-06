/* =========================================================
   UTILIDADES COMPARTIDAS (las usan modelo, vistas y controladores)
   ========================================================= */
const $ = (id) => document.getElementById(id);
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esPantallaAngosta = () => window.matchMedia("(max-width: 900px)").matches;

/** Desplaza la página hasta un elemento (sin animación si el usuario prefiere menos movimiento). */
function desplazarA(elemento, block = "start") {
  elemento.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block });
}

/** Distancia en km entre dos puntos (fórmula de Haversine). */
function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
