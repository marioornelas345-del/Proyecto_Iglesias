/* =========================================================
   MI PERFIL
   Datos, foto e iglesias visitadas del usuario.
   Se guardan en este navegador (localStorage), una ficha por correo.
   Lo que escribe el usuario se pone con .value y .textContent,
   nunca con innerHTML.
   ========================================================= */
const CLAVE_PERFILES = "templos-merida-perfiles";
const TAMANO_FOTO = 256; // lado en píxeles de la foto de perfil

function leerPerfil() {
  return leerJSON(CLAVE_PERFILES, {})[usuarioActual.email] || {};
}

/** Guarda los cambios en la ficha del usuario. Devuelve false si no hubo espacio. */
function guardarPerfil(cambios) {
  const perfiles = leerJSON(CLAVE_PERFILES, {});
  perfiles[usuarioActual.email] = { ...perfiles[usuarioActual.email], ...cambios };
  return guardarJSON(CLAVE_PERFILES, perfiles);
}

function mensajePerfil(id, texto, exito = false) {
  $(id).textContent = texto;
  $(id).classList.toggle("exito", exito);
}

/** Foto o inicial del usuario en la tarjeta del perfil. */
function pintarFotoPerfil(perfil, nombre) {
  const foto = perfil.foto || usuarioActual.photoURL;
  $("perfil-foto").hidden = !foto;
  $("perfil-inicial").hidden = Boolean(foto);
  if (foto) $("perfil-foto").src = foto;
  $("perfil-inicial").textContent = nombre.charAt(0).toUpperCase();
  $("perfil-quitar-foto").hidden = !perfil.foto;
}

/** Contador y barra de iglesias visitadas. */
function pintarConteoVisitadas(perfil) {
  const total = (perfil.visitadas || []).length;
  $("perfil-conteo").textContent = `${total} de ${TEMPLOS.length}`;
  $("perfil-visitadas-campo").value = `${total} de ${TEMPLOS.length}`;
  $("perfil-barra").style.width = `${(total / TEMPLOS.length) * 100}%`;
}

/** Iglesia favorita en la tarjeta del perfil. */
function pintarFavorita(perfil) {
  const t = TEMPLOS.find((x) => x.clave === perfil.favorita);
  $("perfil-favorita").textContent = t ? `${t.tipo} ${t.nombre}` : "Sin elegir";
}

/** Llena la vista con los datos del usuario que inició sesión. */
function pintarPerfil() {
  if (!usuarioActual) return; // abierta con el enlace, antes de iniciar sesión
  const perfil = leerPerfil();
  const nombre = nombreDeUsuario(usuarioActual);

  $("perfil-nombre-tarjeta").textContent = nombre;
  $("perfil-correo").textContent = usuarioActual.email;
  pintarFotoPerfil(perfil, nombre);
  pintarFavorita(perfil);

  const creada = usuarioActual.creada || usuarioActual.metadata?.creationTime;
  $("perfil-miembro-fila").hidden = !creada;
  if (creada) $("perfil-miembro").textContent = new Date(creada).toLocaleDateString("es-MX", { dateStyle: "long" });

  $("perfil-nombre").value = nombre;
  $("perfil-libros").value = perfil.librosLeidos || "";
  $("perfil-ciudad").value = perfil.ciudad || "";
  $("perfil-iglesia").value = perfil.favorita || "";
  $("perfil-sobre").value = perfil.sobre || "";
  mensajePerfil("perfil-mensaje", "");
  mensajePerfil("perfil-mensaje-foto", "");

  const visitadas = perfil.visitadas || [];
  $("perfil-templos").innerHTML = TEMPLOS.map((t) => `
    <button class="perfil-templo" type="button" data-templo="${t.clave}" aria-pressed="${visitadas.includes(t.clave)}">
      ${t.foto ? `<img src="${t.foto}" alt="" loading="lazy">` : ""}
      <span>${t.tipo} ${t.nombre}</span>
    </button>`).join("");
  pintarConteoVisitadas(perfil);
}

/** Guarda el formulario "Mis datos". */
function guardarDatos(e) {
  e.preventDefault();
  const nombre = $("perfil-nombre").value.trim();
  const campoLibros = $("perfil-libros");
  if (nombre.length < 2) return mensajePerfil("perfil-mensaje", "Escribe tu nombre.");
  // Con texto inválido el campo numérico da "" pero marca badInput
  if (campoLibros.validity.badInput || (campoLibros.value && !/^\d{1,4}$/.test(campoLibros.value))) {
    return mensajePerfil("perfil-mensaje", "Libros leídos debe ser un número entero, de 0 a 9999.");
  }

  const guardado = guardarPerfil({
    nombre,
    librosLeidos: campoLibros.value,
    telefono: undefined,   // campo retirado: se borra lo que hubiera guardado
    nacimiento: undefined, // campo retirado
    ciudad: $("perfil-ciudad").value.trim(),
    favorita: $("perfil-iglesia").value,
    sobre: $("perfil-sobre").value.trim()
  });
  if (!guardado) return mensajePerfil("perfil-mensaje", "No se pudo guardar: el navegador no tiene espacio.");

  // El nombre también se usa en la cuenta
  if (fb) {
    fb.updateProfile(fb.auth.currentUser, { displayName: nombre }).catch(console.warn);
  } else {
    const cuentas = leerJSON(CLAVE_CUENTAS, {});
    cuentas[usuarioActual.email].nombre = nombre;
    guardarJSON(CLAVE_CUENTAS, cuentas);
  }
  pintarUsuario(usuarioActual);
  mensajePerfil("perfil-mensaje", "Cambios guardados.", true);
}

/** Recorta la imagen en un cuadrado pequeño para que quepa en localStorage. */
async function reducirFoto(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    await new Promise((listo, fallo) => {
      img.onload = listo;
      img.onerror = fallo;
      img.src = url;
    });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const lienzo = document.createElement("canvas");
    lienzo.width = lienzo.height = TAMANO_FOTO;
    lienzo.getContext("2d").drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, TAMANO_FOTO, TAMANO_FOTO);
    return lienzo.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function cambiarFoto(e) {
  const archivo = e.target.files[0];
  e.target.value = ""; // permite volver a elegir el mismo archivo
  if (!archivo) return;
  try {
    if (!guardarPerfil({ foto: await reducirFoto(archivo) })) throw new Error("Sin espacio");
    pintarUsuario(usuarioActual);
    mensajePerfil("perfil-mensaje-foto", "Foto actualizada.", true);
  } catch {
    mensajePerfil("perfil-mensaje-foto", "No se pudo usar esa imagen. Prueba con otra.");
  }
}

function quitarFoto() {
  guardarPerfil({ foto: null });
  pintarUsuario(usuarioActual);
  mensajePerfil("perfil-mensaje-foto", "Foto quitada.", true);
}

/** Marca o desmarca una iglesia como visitada (se guarda al momento). */
function alternarVisitada(e) {
  const boton = e.target.closest("[data-templo]");
  if (!boton) return;
  const visitadas = new Set(leerPerfil().visitadas);
  const marcada = !visitadas.has(boton.dataset.templo);
  if (marcada) visitadas.add(boton.dataset.templo);
  else visitadas.delete(boton.dataset.templo);
  guardarPerfil({ visitadas: [...visitadas] });
  boton.setAttribute("aria-pressed", marcada);
  pintarConteoVisitadas(leerPerfil());
}

/** Regresa a donde estaba el usuario antes de abrir su perfil. */
function salirDePerfil() {
  if (vistaDesdeFicha) history.back();
  else location.hash = "#inicio"; // se abrió directo con el enlace
}

/** Conecta los botones y formularios del perfil. */
function conectarPerfil() {
  $("perfil-iglesia").insertAdjacentHTML("beforeend", TEMPLOS.map((t) => `<option value="${t.clave}">${t.tipo} ${t.nombre}</option>`).join(""));
  $("perfil-volver").addEventListener("click", salirDePerfil);
  $("form-perfil").addEventListener("submit", guardarDatos);
  $("perfil-cambiar-foto").addEventListener("click", () => $("perfil-archivo").click());
  $("perfil-archivo").addEventListener("change", cambiarFoto);
  $("perfil-quitar-foto").addEventListener("click", quitarFoto);
  $("perfil-templos").addEventListener("click", alternarVisitada);
  $("perfil-salir").addEventListener("click", cerrarSesion);
}
