/* =========================================================
   CONTROLADOR · MI PERFIL (CRUD de la ficha y de la cuenta)
   ========================================================= */
const TAMANO_FOTO = 256; // lado en píxeles de la foto de perfil

const perfilActual = () => Perfiles.leer(estado.usuario.email);
const guardarEnPerfil = (cambios) => Perfiles.guardar(estado.usuario.email, cambios);

/** Leer: llena la vista del perfil. */
function mostrarPerfil() {
  if (!estado.usuario) return; // abierta con el enlace, antes de iniciar sesión
  pintarPerfil(estado.usuario, perfilActual(), nombreDeUsuario(estado.usuario));
}

/** Actualizar: guarda el formulario "Mis datos". */
async function guardarDatos(e) {
  e.preventDefault();
  const datos = leerFormularioPerfil();
  if (datos.nombre.length < 2) return mensajePerfil("perfil-mensaje", "Escribe tu nombre.");
  if (datos.librosInvalido || (datos.librosLeidos && !/^\d{1,4}$/.test(datos.librosLeidos))) {
    return mensajePerfil("perfil-mensaje", "Libros leídos debe ser un número entero, de 0 a 9999.");
  }

  try {
    await guardarEnPerfil({
    nombre: datos.nombre,
    librosLeidos: datos.librosLeidos,
    telefono: undefined,   // campo retirado: se borra lo que hubiera guardado
    nacimiento: undefined, // campo retirado
    ciudad: datos.ciudad,
    favorita: datos.favorita,
    sobre: datos.sobre
    });
  } catch (error) {
    console.error(error);
    return mensajePerfil("perfil-mensaje", "No se pudo guardar en Supabase. Revisa las políticas RLS y la conexión.");
  }

  // El nombre también se usa en la cuenta
  cuentas.cambiarNombre(estado.usuario, datos.nombre).catch((error) => console.warn("No se pudo actualizar el nombre de la cuenta:", error));
  refrescarUsuario();
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
    await guardarEnPerfil({ foto: await reducirFoto(archivo) });
    refrescarUsuario();
    mensajePerfil("perfil-mensaje-foto", "Foto actualizada.", true);
  } catch {
    mensajePerfil("perfil-mensaje-foto", "No se pudo usar esa imagen. Prueba con otra.");
  }
}

async function quitarFoto() {
  try {
    await guardarEnPerfil({ foto: null });
    refrescarUsuario();
    mensajePerfil("perfil-mensaje-foto", "Foto quitada.", true);
  } catch (error) {
    console.error(error);
    mensajePerfil("perfil-mensaje-foto", "No se pudo actualizar la foto en Supabase.");
  }
}

/** Marca o desmarca una iglesia como visitada (se guarda al momento). */
async function alternarVisitada(e) {
  const boton = e.target.closest("[data-templo]");
  if (!boton) return;
  boton.disabled = true;
  try {
    const visitadas = await Perfiles.alternarVisitada(estado.usuario.email, boton.dataset.templo);
    boton.setAttribute("aria-pressed", visitadas.includes(boton.dataset.templo));
    pintarConteoVisitadas(visitadas);
  } catch (error) {
    console.error(error);
    mensajePerfil("perfil-mensaje", "No se pudo guardar la visita en Supabase.");
  } finally {
    boton.disabled = false;
  }
}

/** Borrar: elimina la cuenta y su perfil, y regresa al inicio de sesión. */
async function eliminarCuenta(e) {
  e.preventDefault();
  const pideContrasena = cuentas.pideContrasena(estado.usuario);
  const contrasena = $("eliminar-contrasena").value;
  if (pideContrasena && !contrasena) return mensajePerfil("eliminar-mensaje", "Escribe tu contraseña para confirmar.");

  const correo = estado.usuario.email;
  bloquearEliminar(true);
  try {
    await cuentas.eliminar(estado.usuario, pideContrasena ? contrasena : null);
  } catch (error) {
    bloquearEliminar(false);
    return mensajePerfil("eliminar-mensaje", traducirError(error.code));
  }
  Perfiles.eliminar(correo);
  cerrarConfirmarEliminar();
  mostrarLogin();
  mensajeAuth("Tu cuenta se eliminó. Puedes crear una nueva cuando quieras.", true);
}

function conectarPerfil() {
  pintarOpcionesIglesia();
  $("perfil-volver").addEventListener("click", salirDePerfil);
  $("form-perfil").addEventListener("submit", guardarDatos);
  $("perfil-cambiar-foto").addEventListener("click", () => $("perfil-archivo").click());
  $("perfil-archivo").addEventListener("change", cambiarFoto);
  $("perfil-quitar-foto").addEventListener("click", quitarFoto);
  $("perfil-templos").addEventListener("click", alternarVisitada);
  $("perfil-salir").addEventListener("click", cerrarSesion);

  // Eliminar mi cuenta
  $("perfil-eliminar").addEventListener("click", () => abrirConfirmarEliminar(cuentas.pideContrasena(estado.usuario)));
  $("eliminar-cancelar").addEventListener("click", cerrarConfirmarEliminar);
  $("form-eliminar").addEventListener("submit", eliminarCuenta);
  $("confirmar-eliminar").addEventListener("click", (e) => {
    if (e.target === $("confirmar-eliminar")) cerrarConfirmarEliminar(); // clic fuera de la ventana
  });
}
