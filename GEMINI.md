# Templos de Mérida (Gemini)

Las reglas completas del proyecto están en **AGENTS.md** (estructura MVC, `?v=N`,
datos verificados, fotos de arte sacro y cómo probar). Léelo antes de cambiar algo.

`.gemini/settings.json` ya carga AGENTS.md como contexto.

Resumen:
- Sitio estático en español; `npm run dev`.
- Scripts clásicos: el orden en index.html importa y no se repiten nombres globales.
- Al terminar: `node scripts/revisar.mjs` y `node scripts/probar.mjs`.
