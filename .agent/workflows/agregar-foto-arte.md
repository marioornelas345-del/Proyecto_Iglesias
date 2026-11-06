---
description: Agrega la foto de una pieza de arte sacro verificando que sea la correcta
---

1. Identifica la iglesia y la pieza en `js/modelo/patrimonio.js` y lee su descripción.
2. Verifica que la foto muestre **esa** pieza en **esa** iglesia (compara con la
   descripción y busca la fuente: Diario de Yucatán «100 joyas», Wikimedia Commons).
   Si muestra otra obra, detente y explica por qué no coincide.
3. Guarda la imagen en `img/arte-<pieza>-<iglesia>.jpg` (máx. 1920 px, sin marcos ni textos).
4. Agrega `fotoLocal: { foto, credito, licencia?, pagina? }` a la pieza.
5. Sube `patrimonio.js?v=N` en `index.html` y corre el workflow `/probar-sitio`.
