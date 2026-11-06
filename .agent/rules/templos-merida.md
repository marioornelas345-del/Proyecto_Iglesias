---
trigger: always_on
---

# Templos de Mérida (Google Antigravity)

Lee y sigue **AGENTS.md** en la raíz: ahí están la estructura MVC, las reglas de
datos verificados y de fotos, y cómo probar.

Recordatorios clave:
- Sitio estático en español; correr con `npm run dev` (puerto 5173).
- Scripts clásicos: respeta el orden de `index.html` y no repitas nombres globales.
- Sube el `?v=N` del archivo cambiado en `index.html`.
- Termina siempre con `node scripts/revisar.mjs` y `node scripts/probar.mjs`.
