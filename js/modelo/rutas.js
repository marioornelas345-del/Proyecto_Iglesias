/* =========================================================
   MODELO · RUTAS
   Tu ubicación (si das permiso) y el servicio de rutas de
   OpenStreetMap (OSRM). No dibuja nada: solo da los datos.
   ========================================================= */
const SERVIDOR_RUTAS = {
  pie: "https://routing.openstreetmap.de/routed-foot/route/v1/foot/",
  auto: "https://routing.openstreetmap.de/routed-car/route/v1/driving/"
};
const PLAZA_GRANDE = { lat: 20.96695, lon: -89.62375 }; // punto de salida si no hay ubicación
let ubicacionUsuario; // undefined = aún no se pregunta; null = sin permiso

/** Pide la ubicación del usuario. Devuelve null si no da permiso o no se puede. */
function obtenerUbicacion() {
  return new Promise((resolver) => {
    if (!navigator.geolocation) return resolver(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolver({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolver(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

/** Punto de salida: tu ubicación (se pide una sola vez), o la Plaza Grande si no hay permiso o estás lejos de Mérida. */
async function puntoDeSalida() {
  if (ubicacionUsuario === undefined) ubicacionUsuario = await obtenerUbicacion();
  if (!ubicacionUsuario || distanciaKm(ubicacionUsuario, PLAZA_GRANDE) > 25) return { ...PLAZA_GRANDE, desdePlaza: true };
  return { ...ubicacionUsuario, desdePlaza: false };
}

/** Pide el camino a OSRM y devuelve su geometría (GeoJSON). */
async function buscarRuta(origen, destino, modo) {
  const url = `${SERVIDOR_RUTAS[modo]}${origen.lon},${origen.lat};${destino.lon},${destino.lat}?overview=full&geometries=geojson`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("El servicio de rutas respondió " + respuesta.status);
  const ruta = (await respuesta.json()).routes?.[0];
  if (!ruta) throw new Error("No se encontró una ruta");
  return ruta.geometry;
}
