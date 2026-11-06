# Templos de Mérida (GitHub Copilot)

Sigue las reglas de **AGENTS.md** en la raíz del repositorio. Lo más importante:

- Sitio estático (HTML, CSS, JS sin framework), textos en español sencillo.
- Arquitectura MVC: `js/modelo/` (datos, sin DOM), `js/vistas/` (solo dibujan),
  `js/controladores/` (eventos y coordinación).
- Scripts clásicos: el orden en `index.html` importa y no se repiten nombres globales.
- Al cambiar un `.js` o `.css`, sube su `?v=N` en `index.html`.
- Entrada del usuario con `.textContent`/`.value`, nunca `innerHTML`.
- Solo datos con fuente; lo dudoso lleva `sinConfirmar: true`.
- Verifica con `node scripts/revisar.mjs` y `node scripts/probar.mjs`.
