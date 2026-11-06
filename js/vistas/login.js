/* =========================================================
   VISTA · INICIO DE SESIÓN, CREAR CUENTA Y NAVBAR DEL USUARIO
   ========================================================= */

/** Reproduce o detiene el video de fondo (no gasta recursos con el login oculto). */
function videoLogin(activo) {
  const video = $("auth-video");
  if (activo && !reducirMovimiento) video.play().catch(() => {}); // sin video se ve la imagen fija
  else video.pause();
}

/** Funde el video a negro justo antes de que vuelva a empezar. */
function prepararVideoLogin() {
  const video = $("auth-video");
  video.addEventListener("timeupdate", () => {
    video.classList.toggle("fundido", video.duration - video.currentTime < 0.7);
  });
  if (reducirMovimiento) videoLogin(false);
}

/** Reinicia la animación de un elemento (para la transición entre pestañas). */
function animar(elemento) {
  elemento.classList.remove("auth-animar");
  void elemento.offsetWidth; // obliga al navegador a "olvidar" la animación anterior
  elemento.classList.add("auth-animar");
}

/** Pestaña "Iniciar sesión" o "Crear cuenta". */
function pintarModoAuth(modo) {
  const registro = modo === "registro";
  const recuperar = modo === "recuperar";
  $("auth-titulo").textContent = registro ? "Crear cuenta" : recuperar ? "Nueva contraseña" : "Iniciar sesión";
  $("auth-sub").textContent = recuperar
    ? "Escribe y confirma tu nueva contraseña."
    : registro ? "Regístrate para explorar las iglesias de Mérida." : "Accede para explorar las iglesias de Mérida.";
  $("btn-enviar").textContent = registro ? "Crear cuenta" : recuperar ? "Guardar contraseña" : "Iniciar sesión";
  animar($("auth-encabezado"));
  animar($("btn-enviar"));
  $("campo-nombre").hidden = !registro;
  $("campo-confirmar").hidden = !(registro || recuperar);
  $("btn-olvide").hidden = registro || recuperar;
  $("contrasena").autocomplete = registro || recuperar ? "new-password" : "current-password";
  $("auth-pestanas").hidden = recuperar;
  $("auth-separador").hidden = recuperar;
  $("btn-google").hidden = recuperar;
  $("tab-login").classList.toggle("activa", !registro && !recuperar);
  $("tab-registro").classList.toggle("activa", registro);
  $("tab-login").setAttribute("aria-selected", !registro && !recuperar);
  $("tab-registro").setAttribute("aria-selected", registro);
  limpiarErrores();
}

/** Lo que el usuario escribió en el formulario. */
function leerFormularioAuth() {
  return {
    nombre: $("nombre").value.trim(),
    correo: $("correo").value.trim(),
    contrasena: $("contrasena").value,
    confirmar: $("confirmar").value
  };
}

function marcarError(campo, mensaje) {
  $("error-" + campo).textContent = mensaje;
  $(campo).setAttribute("aria-invalid", mensaje ? "true" : "false");
}

function limpiarErrores() {
  ["nombre", "correo", "contrasena", "confirmar"].forEach((c) => marcarError(c, ""));
  mensajeAuth("");
}

function mensajeAuth(texto, exito = false) {
  $("auth-mensaje").textContent = texto;
  $("auth-mensaje").classList.toggle("exito", exito);
}

function bloquearAuth(si) {
  $("btn-enviar").disabled = si;
  $("btn-google").disabled = si;
}

/** Sin Firebase no hay acceso con Google. */
function ocultarGoogle() {
  $("btn-google").hidden = true;
  document.querySelector(".a-separador").hidden = true;
}

/** Muestra u oculta la contraseña. */
function alternarVerContrasena() {
  const campo = $("contrasena");
  const mostrar = campo.type === "password";
  campo.type = mostrar ? "text" : "password";
  $("btn-ver").textContent = mostrar ? "Ocultar" : "Ver";
}

/** Nombre y foto (o inicial) del usuario en la navbar. */
function pintarUsuario(nombre, foto) {
  $("usuario-nombre").textContent = nombre;
  $("bienvenida").textContent = `Bienvenido, ${nombre}`;
  if (foto) {
    $("avatar-foto").src = foto;
    $("avatar-foto").hidden = false;
    $("avatar-inicial").hidden = true;
  } else {
    $("avatar-inicial").textContent = nombre.charAt(0).toUpperCase();
    $("avatar-inicial").hidden = false;
    $("avatar-foto").hidden = true;
  }
}

/**
 * Oculta el login y reproduce la animación de entrada con zoom.
 * alMostrarApp() se llama cuando la aplicación ya está visible.
 */
function animarEntrada(alMostrarApp) {
  window.scrollTo(0, 0); // al entrar se ve primero la portada

  if (reducirMovimiento) {
    $("auth").hidden = true;
    videoLogin(false);
    $("app").hidden = false;
    alMostrarApp();
    return;
  }

  // 1) El login se desvanece
  $("auth").classList.add("saliendo");
  setTimeout(() => {
    $("auth").hidden = true;
    videoLogin(false);
    $("auth").classList.remove("saliendo");

    // 2) Pantalla negra: el logo se dibuja y se acerca (unos 3 segundos)
    const intro = $("intro");
    intro.classList.remove("zoom");
    intro.hidden = false;

    setTimeout(() => {
      // 3) Zoom a través de la puerta y la escena llega a la pantalla
      $("app").hidden = false;
      alMostrarApp();
      document.body.classList.add("llegando");
      intro.classList.add("zoom");

      setTimeout(() => {
        intro.hidden = true;
        intro.classList.remove("zoom");
      }, 1600);
      setTimeout(() => document.body.classList.remove("llegando"), 2300);
    }, 3200);
  }, 600);
}

/** Pantalla de inicio de sesión limpia. */
function pintarPantallaLogin() {
  $("app").hidden = true;
  $("intro").hidden = true;
  $("auth").hidden = false;
  videoLogin(true);
  $("form-auth").reset();
  $("contrasena").type = "password";
  $("btn-ver").textContent = "Ver";
  pintarModoAuth("login");
  window.scrollTo(0, 0);
}
