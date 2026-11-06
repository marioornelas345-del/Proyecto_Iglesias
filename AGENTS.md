# Templos de Mérida — instrucciones para agentes

Este archivo es la fuente única de reglas para cualquier agente de código
(ChatGPT/Codex, GitHub Copilot, Google Antigravity, Gemini, Claude Code…).
Los demás archivos de instrucciones solo apuntan aquí.

## Qué es
Sitio estático sobre 10 iglesias del Centro Histórico de Mérida, Yucatán:
carrusel, ficha de cada iglesia con mapa y ruta, y por iglesia los apartados
**Libros**, **Arte sacro** y **Eventos y misas**. Tiene inicio de sesión y perfil
con Supabase Auth, y una **Gestión de la iglesia** (`#gestion/<modulo>`) por roles:
panel, miembros, asistencia, eventos, ministerios, donaciones, anuncios, reportes
(PDF/Excel), configuración y usuarios. Ver `SUPABASE-CONFIG.md`.

- Sin framework ni compilación: HTML + CSS + JavaScript.
- Correr: `npm run dev` → http://localhost:5173
- Todos los textos que ve el usuario están **en español sencillo**.

## Estructura (MVC)
```
index.html            Página única; carga los scripts EN ORDEN
css/                  Un archivo por sección (todas.css, perfil.css, …)
js/util.js            $, desplazarA, distanciaKm (compartidas)
js/modelo/            Datos y reglas. NO tocan el DOM.
  estado.js           Estado actual (iglesia elegida, usuario, …)
  datos.js            TEMPLOS: las 10 iglesias
  patrimonio.js       Libros y arte sacro por iglesia + EXPLICACIONES
  misas.js            Horarios de misa y fiestas
  fotos.js            FOTOS_LOCALES (fotos de Wikimedia guardadas en img/)
  almacen.js          Único archivo que usa localStorage
  cuentas.js          CRUD de cuentas: CuentasLocales y Firebase (mismos métodos)
  perfiles.js         CRUD de perfiles
  piezas.js           Arma las tarjetas de libros y arte
  rutas.js            Ubicación y rutas de OpenStreetMap
  gestion.js          GestionModelo: roles, permisos y CRUD de las tablas de gestión
  reportes.js         GestionReportes: arma las tablas de los reportes
js/vistas/gestion.js  GestionVista (todo con textContent) · vistas/exportar.js PDF y Excel
js/controladores/gestion.js  Rutas #gestion, formularios y botones (data-accion / data-form)
supabase/             SQL de ayuda (primer administrador)
_respaldo-js-viejo/   Archivos JS de antes del MVC (no se cargan)
js/vistas/            Solo dibujan lo que reciben por parámetro
js/controladores/     Clics, cambios de estado y coordinación modelo ↔ vista
js/main.js            Arranque
img/                  Fotos (hasta 1920 px) · img/mini/ miniaturas de 480 px
libros/               PDFs de dominio público (Internet Archive)
```

## Reglas obligatorias
1. **Scripts clásicos, no módulos.** Comparten variables globales: el orden de
   `<script>` en `index.html` importa y **no se pueden repetir nombres globales**
   entre archivos (rompe la carga).
2. **Caché:** al cambiar un `.js` o `.css`, sube su `?v=N` en `index.html`.
   Guarda `index.html` en UTF-8 **sin BOM**.
3. **Respeta MVC:** el modelo no toca el DOM; las vistas no leen localStorage ni
   cambian el estado; los controladores no arman HTML largo.
4. **Seguridad:** lo que escribe el usuario se pone con `.textContent` o `.value`,
   nunca con `innerHTML`.
5. **Solo datos verificados.** Cada dato de iglesias, arte, libros o misas debe
   tener una fuente real. Lo dudoso se marca `sinConfirmar: true` (se muestra
   "Sin confirmar hoy"); lo destruido, `perdida: true`. No inventes fechas, autores
   ni horarios.
6. **Fotos de arte sacro:** solo si muestran la pieza real de ESA iglesia. Si una
   foto muestra otra obra (aunque sea del mismo tema), no se usa. Las fotos van en
   `img/` como `.jpg` (máx. 1920 px) y se enlazan con `fotoLocal` en `patrimonio.js`.
7. Las horas de término de misa son aproximadas (`DURACION_MISA = 60`).
8. No subas claves (Firebase, APIs) al repositorio.

## Cómo verificar un cambio
```
node scripts/revisar.mjs   # sintaxis, archivos de index.html y nombres globales repetidos
node scripts/probar.mjs    # abre Edge/Chrome sin ventana y recorre todo el sitio
```
Un cambio está terminado solo si ambos terminan con `OK` y sin errores.

## Tareas frecuentes
- **Agregar una pieza de arte:** `js/modelo/patrimonio.js` → `PATRIMONIO[clave].arte[categoria]`;
  su explicación en `EXPLICACIONES["clave/Nombre"]` (`significado`, `creacion`).
- **Agregar una iglesia:** `datos.js` (TEMPLOS) + fotos en `fotos.js` e `img/` +
  `img/mini/` + `PATRIMONIO` + `MISAS`; luego sube versiones y prueba.
- **Cambiar horarios:** `js/modelo/misas.js`, con fuente y fecha de la fuente.
