/* =========================================================
   PIEZAS DE DIBUJO (SVG) PARA LAS FACHADAS
   viewBox 400 x 340, el piso está en y = 320
   ========================================================= */
const PISO = 320;

// Puerta en arco iluminada
function puerta(x, y, w, h) {
  const r = w / 2;
  return `<path d="M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${w} 0V${y + h}z" fill="url(#luz)" filter="url(#brillo)"/>
          <path d="M${x - 5} ${y + h}V${y + r}a${r + 5} ${r + 5} 0 0 1 ${w + 10} 0V${y + h}" fill="none" stroke="#5a4f46" stroke-width="3"/>
          <line x1="${x + r}" y1="${y + r - 4}" x2="${x + r}" y2="${y + h}" stroke="#c9822a" stroke-width="1.5"/>`;
}

// Ventana en arco (iluminada u oscura)
function ventana(x, y, w, h, encendida = true) {
  const r = w / 2;
  return `<path d="M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${w} 0V${y + h}z" fill="${encendida ? "url(#luz)" : "#2a2430"}" ${encendida ? 'filter="url(#brillo)" opacity="0.85"' : ""}/>`;
}

// Hueco de campanario con su campana
function campana(cx, cy, w = 22, h = 30) {
  const r = w / 2;
  return `<path d="M${cx - r} ${cy + h}V${cy + r}a${r} ${r} 0 0 1 ${w} 0V${cy + h}z" fill="#1b1622"/>
          <path d="M${cx - 6} ${cy + h - 6}c0-12 2-15 6-15s6 3 6 15z" fill="#c9a24e"/>
          <circle cx="${cx}" cy="${cy + h - 4}" r="2" fill="#c9a24e"/>`;
}

// Cúpula pequeña sobre una torre
function cupula(cx, y, w) {
  return `<path d="M${cx - w / 2} ${y}a${w / 2} ${w / 2.2} 0 0 1 ${w} 0z" fill="url(#piedra-sombra)"/>
          <path d="M${cx} ${y - w / 2.2}v-12M${cx - 5} ${y - w / 2.2 - 7}h10" stroke="#8f8578" stroke-width="2"/>`;
}

// Cruz
function cruz(cx, y, t = 14) {
  return `<path d="M${cx} ${y}v-${t}M${cx - t / 3} ${y - t * 0.66}h${(t / 3) * 2}" stroke="#a69b8c" stroke-width="2.5"/>`;
}

// Árbol de copa redonda (silueta)
function arbol(x, s = 1) {
  return `<g fill="#070b16" transform="translate(${x} ${PISO}) scale(${s})">
            <rect x="-4" y="-60" width="8" height="60"/>
            <circle cx="0" cy="-88" r="34"/><circle cx="-26" cy="-70" r="24"/><circle cx="26" cy="-72" r="26"/><circle cx="8" cy="-112" r="22"/>
          </g>`;
}

// Palmera (silueta)
function palmera(x, s = 1) {
  return `<g fill="none" stroke="#070b16" stroke-linecap="round" transform="translate(${x} ${PISO}) scale(${s})">
            <path d="M0 0c-2-40 4-90 2-130" stroke-width="6"/>
            <path d="M2 -130c-20-6-38 2-50 16M2 -130c18-8 38-2 50 14M2 -130c-10-18-30-22-44-18M2 -130c10-18 30-22 42-16M2 -130c0-14 6-26 14-32" stroke-width="5"/>
          </g>`;
}

// Agave (planta yucateca)
function agave(x, s = 1) {
  return `<g fill="#0a1310" transform="translate(${x} ${PISO}) scale(${s})">
            <path d="M0 0L-26 -10L-6 -6L-14 -36L0 -8L10 -40L6 -6L28 -14L8 0z"/>
          </g>`;
}

/* Cada fachada es una función que regresa el SVG completo */
const FACHADAS = {
  catedral: () => `
    ${arbol(28, 0.9)}${arbol(374, 1)}
    <!-- Torres -->
    <rect x="52" y="78" width="66" height="242" fill="url(#piedra-sombra)"/>
    <rect x="282" y="78" width="66" height="242" fill="url(#piedra-sombra)"/>
    <rect x="62" y="56" width="46" height="24" fill="url(#piedra)"/>
    <rect x="292" y="56" width="46" height="24" fill="url(#piedra)"/>
    ${cupula(85, 56, 40)}${cupula(315, 56, 40)}
    ${campana(85, 96, 20, 28)}${campana(315, 96, 20, 28)}
    ${ventana(77, 170, 16, 28)}${ventana(307, 170, 16, 28)}
    ${ventana(77, 240, 16, 28, false)}${ventana(307, 240, 16, 28, false)}
    <!-- Cuerpo central -->
    <rect x="114" y="108" width="172" height="212" fill="url(#piedra)"/>
    <rect x="110" y="100" width="180" height="10" fill="#9c9183"/>
    <path d="M114 100h172" stroke="#c7bfb3" stroke-width="2"/>
    <!-- Gran arco ciego -->
    <path d="M140 320V180a60 60 0 0 1 120 0v140" fill="#6f665c"/>
    <path d="M150 320V182a50 50 0 0 1 100 0v138" fill="#7d7367"/>
    ${ventana(188, 150, 24, 34)}
    <!-- Portada -->
    <rect x="166" y="222" width="68" height="98" fill="#8a8073"/>
    ${puerta(178, 236, 44, 84)}
    <path d="M170 222h60" stroke="#c7bfb3" stroke-width="3"/>
    ${cruz(200, 100, 18)}`,

  santalucia: () => `
    ${arbol(40, 1.05)}${arbol(362, 0.95)}${arbol(318, 0.7)}
    <!-- Cuerpo bajo -->
    <rect x="108" y="172" width="184" height="148" fill="url(#piedra)"/>
    <path d="M104 172h192" stroke="#c7bfb3" stroke-width="4"/>
    <!-- Espadaña escalonada con tres campanas -->
    <path d="M140 172V128h22v-18h22v-20h32v20h22v18h22v44z" fill="url(#piedra)"/>
    ${campana(167, 132, 20, 28)}${campana(233, 132, 20, 28)}${campana(200, 98, 18, 26)}
    ${cruz(200, 90, 16)}
    <circle cx="200" cy="208" r="12" fill="url(#luz)" filter="url(#brillo)" opacity="0.85"/>
    ${puerta(178, 238, 44, 82)}
    ${ventana(128, 236, 14, 26, false)}${ventana(258, 236, 14, 26, false)}`,

  jesus: () => `
    ${arbol(30, 1.1)}${arbol(370, 1.05)}
    <!-- Torres esbeltas -->
    <rect x="86" y="96" width="44" height="224" fill="url(#piedra-sombra)"/>
    <rect x="270" y="96" width="44" height="224" fill="url(#piedra-sombra)"/>
    ${campana(108, 104, 18, 26)}${campana(292, 104, 18, 26)}
    ${cupula(108, 96, 36)}${cupula(292, 96, 36)}
    <!-- Fachada -->
    <rect x="126" y="112" width="148" height="208" fill="url(#piedra)"/>
    <path d="M120 112h160l-80-34z" fill="#9c9183"/>
    ${cruz(200, 78, 16)}
    <!-- Columnas pareadas -->
    <g stroke="#6f665c" stroke-width="5">
      <path d="M158 320V214M168 320V214M232 320V214M242 320V214"/>
    </g>
    <path d="M150 214h100" stroke="#c7bfb3" stroke-width="4"/>
    <!-- Nicho con imagen -->
    <path d="M188 200v-30a12 12 0 0 1 24 0v30z" fill="#3a3238"/>
    <path d="M196 198v-18a4 4 0 0 1 8 0v18z" fill="url(#luz)" filter="url(#brillo)" opacity="0.75"/>
    ${ventana(190, 128, 20, 26)}
    ${puerta(180, 240, 40, 80)}`,

  santaana: () => `
    ${palmera(48, 1)}${arbol(352, 1.1)}${arbol(20, 0.75)}
    <!-- Fachada -->
    <rect x="108" y="140" width="184" height="180" fill="url(#piedra)"/>
    <path d="M104 140h192" stroke="#c7bfb3" stroke-width="4"/>
    <!-- Remates en las esquinas -->
    <path d="M110 140v-16l8-10 8 10v16zM274 140v-16l8-10 8 10v16z" fill="#9c9183"/>
    <!-- Torre central de dos cuerpos -->
    <rect x="166" y="86" width="68" height="56" fill="url(#piedra)"/>
    <rect x="176" y="46" width="48" height="42" fill="url(#piedra-sombra)"/>
    ${campana(185, 96, 16, 30)}${campana(215, 96, 16, 30)}
    ${campana(200, 52, 16, 28)}
    <path d="M172 46l28-26 28 26z" fill="#7d7367"/>
    ${cruz(200, 20, 16)}
    ${ventana(188, 162, 24, 36)}
    ${puerta(176, 232, 48, 88)}
    ${ventana(130, 240, 14, 28, false)}${ventana(256, 240, 14, 28, false)}`,

  santaisabel: () => `
    ${arbol(48, 1.15)}${arbol(352, 1.1)}
    <!-- Ermita pequeña -->
    <rect x="132" y="196" width="136" height="124" fill="url(#piedra)"/>
    <!-- Cornisa con la fecha -->
    <rect x="126" y="186" width="148" height="14" fill="#9c9183"/>
    <text x="200" y="197" text-anchor="middle" font-family="Cinzel, serif" font-size="10" font-weight="700" fill="#3a3238" letter-spacing="2">1748</text>
    <!-- Espadaña de una campana con remate curvo -->
    <path d="M166 186v-34c0-16 14-28 34-34 20 6 34 18 34 34v34z" fill="url(#piedra)"/>
    ${campana(200, 142, 22, 32)}
    ${cruz(200, 118, 16)}
    ${puerta(180, 244, 40, 76)}
    <!-- Jardín de plantas yucatecas -->
    ${agave(112, 1.1)}${agave(292, 1)}${agave(138, 0.7)}${agave(262, 0.75)}${agave(80, 0.9)}${agave(322, 0.85)}`,

  sancristobal: () => `
    ${arbol(22, 0.95)}${arbol(380, 0.95)}
    <!-- Cúpula detrás -->
    <path d="M150 128a50 46 0 0 1 100 0z" fill="url(#piedra-sombra)"/>
    <rect x="192" y="68" width="16" height="16" fill="#7d7367"/>
    ${cruz(200, 68, 14)}
    <!-- Torres con linternilla -->
    <rect x="52" y="96" width="70" height="224" fill="url(#piedra-sombra)"/>
    <rect x="278" y="96" width="70" height="224" fill="url(#piedra-sombra)"/>
    <rect x="62" y="64" width="50" height="34" fill="url(#piedra)"/>
    <rect x="288" y="64" width="50" height="34" fill="url(#piedra)"/>
    ${campana(87, 68, 18, 28)}${campana(313, 68, 18, 28)}
    ${cupula(87, 64, 44)}${cupula(313, 64, 44)}
    ${ventana(79, 180, 16, 28)}${ventana(305, 180, 16, 28)}
    <!-- Fachada central -->
    <rect x="118" y="128" width="164" height="192" fill="url(#piedra)"/>
    <path d="M114 128h172" stroke="#c7bfb3" stroke-width="4"/>
    <!-- Gran arco con concha -->
    <path d="M144 320V200a56 56 0 0 1 112 0v120" fill="#6f665c"/>
    <g stroke="#8f8578" stroke-width="2">
      <path d="M200 200l-44 0M200 200l-38-28M200 200l-22-46M200 200v-52M200 200l22-46M200 200l38-28M200 200l44 0"/>
    </g>
    ${puerta(178, 232, 44, 88)}`
};

/** Regresa el SVG completo de una fachada. */
function svgFachada(clave, etiqueta) {
  const accesible = etiqueta ? `role="img" aria-label="${etiqueta}"` : `aria-hidden="true"`;
  return `<svg viewBox="0 0 400 340" ${accesible}>
    ${FACHADAS[clave]()}
    <rect x="0" y="${PISO}" width="400" height="20" fill="#0c0a0e"/>
  </svg>`;
}
