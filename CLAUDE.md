@AGENTS.md

## Solo para Claude Code
- Subagentes del proyecto en `.claude/agents/`:
  - `verificador-arte`: revisa si una foto es de verdad la pieza de arte sacro.
  - `probador-sitio`: corre `scripts/revisar.mjs` y `scripts/probar.mjs` y reporta fallas.
- Un hook (`.claude/settings.json`) corre `node scripts/revisar.mjs --rapido` después de
  cada edición; si imprime problemas, corrígelos antes de seguir.
