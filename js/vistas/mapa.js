/* =========================================================
   VISTA · MAPA (Leaflet)
   Marcadores, tarjeta de la iglesia elegida y dibujo de la ruta.
   ========================================================= */
let mapa = null;       // mapa de Leaflet
const marcadores = [];
let capaRuta = null;   // línea de la ruta en el mapa

/** Crea el mapa (una sola vez) con un marcador numerado por iglesia. alElegir(i) se llama al tocar uno. */
function crearMapa(alElegir) {
  if (typeof L === "undefined") return false; // sin internet no carga Leaflet
  if (mapa) { mapa.invalidateSize(); return false; }
  mapa = L.map("mapa", { scrollWheelZoom: false });
  // Mapa de calles de Esri (funciona también al abrir el archivo con doble clic);
  // el CSS lo oscurece para que combine con la escena nocturna
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    maxNativeZoom: 17,
    attribution: 'Mapa &copy; <a href="https://www.esri.com">Esri</a> y sus proveedores'
  }).addTo(mapa);

  TEMPLOS.forEach((t, i) => {
    const marcador = L.marker([t.lat, t.lon], {
      icon: L.divIcon({ className: "", html: `<span class="pin">${i + 1}</span>`, iconSize: [30, 44], iconAnchor: [15, 44] }),
      title: `${t.tipo} ${t.nombre}`
    })
      .bindTooltip(`${t.tipo} ${t.nombre} · ${t.anio}`, { direction: "top", offset: [0, -16] })
      .on("click", () => alElegir(i))
      .addTo(mapa);
    marcadores.push(marcador);
  });

  // Encuadre inicial con todas las iglesias
  mapa.fitBounds(L.latLngBounds(TEMPLOS.map((t) => [t.lat, t.lon])), { padding: [40, 40] });
  return true;
}

/** Recalcula el tamaño del mapa cuando vuelve a verse. */
function ajustarMapa() {
  if (mapa) mapa.invalidateSize();
}

/** Tarjeta sobre el mapa con la iglesia elegida: foto, dirección, distancia y accesos. */
function pintarFichaMapa(i) {
  const t = TEMPLOS[i];
  const n = TEMPLOS.length;
  const distancia = i === 0 ? "Aquí empieza el recorrido" : `A ${distanciaKm(TEMPLOS[0], t).toFixed(1)} km de la Catedral`;
  $("mapa-ficha").innerHTML = `
    <div class="mapa-ficha-cabeza">
      ${t.foto ? `<img src="${t.miniatura}" alt="">` : ""}
      <div>
        <span class="mapa-ficha-num">${String(i + 1).padStart(2, "0")} de ${String(n).padStart(2, "0")}</span>
        <h3>${t.tipo} ${t.nombre}</h3>
        <p class="mapa-ficha-barrio">${t.barrio}</p>
      </div>
    </div>
    <p class="mapa-ficha-direccion">${ICONO_UBICACION}<span><strong>${t.direccion}</strong><br>Mérida, Yucatán · ${distancia}</span></p>
    <div class="mapa-ficha-acciones">
      <button class="boton-contorno" type="button" data-ficha-mover="-1" aria-label="Iglesia anterior">‹</button>
      <button class="boton" type="button" data-ficha-ruta>VER RUTA</button>
      <a class="boton-contorno" href="https://www.google.com/maps/search/?api=1&query=${t.lat},${t.lon}" target="_blank" rel="noopener">Google Maps</a>
      <button class="boton-contorno" type="button" data-ficha-mover="1" aria-label="Iglesia siguiente">›</button>
    </div>`;
}

/** Resalta el marcador de la iglesia i, actualiza su tarjeta y, si se pide, vuela hasta ella. */
function pintarMapa(i, volar) {
  pintarFichaMapa(i);
  if (!mapa) return;
  marcadores.forEach((m, j) => {
    m.getElement()?.querySelector(".pin")?.classList.toggle("activo", j === i);
    m.setZIndexOffset(j === i ? 1000 : 0);
  });
  if (volar) {
    const t = TEMPLOS[i];
    if (reducirMovimiento) mapa.setView([t.lat, t.lon], 16);
    else mapa.flyTo([t.lat, t.lon], 16, { duration: 1.2 });
  }
}

/** Dibuja el camino (con un borde oscuro para que se vea sobre las calles) y un punto en la salida. */
function dibujarRuta(geometria, origen) {
  quitarRuta();
  const borde = L.geoJSON(geometria, { style: { color: "#0b0f1a", weight: 10, opacity: 0.6, lineCap: "round", lineJoin: "round" } });
  const linea = L.geoJSON(geometria, { style: { color: "#E9A23B", weight: 6, opacity: 1, lineCap: "round", lineJoin: "round", className: "ruta-linea" } });
  const flujo = L.geoJSON(geometria, { interactive: false, style: { color: "#FFF4DC", weight: 2, opacity: 0.9, dashArray: "2 14", lineCap: "round", className: "ruta-flujo" } });
  const etiqueta = origen.desdePlaza ? "Plaza Grande" : "Tú estás aquí";
  const origenIcono = L.marker([origen.lat, origen.lon], {
    icon: L.divIcon({ className: "", html: `<span class="origen"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
    title: etiqueta
  }).bindTooltip(etiqueta, { direction: "top", offset: [0, -12] });
  capaRuta = L.layerGroup([borde, linea, flujo, origenIcono]).addTo(mapa);
  mapa.fitBounds(linea.getBounds(), { padding: [50, 50] });
}

/** Borra la ruta del mapa. */
function quitarRuta() {
  if (capaRuta) {
    capaRuta.remove();
    capaRuta = null;
  }
}

const hayMapa = () => Boolean(mapa);
const hayRuta = () => Boolean(capaRuta);
