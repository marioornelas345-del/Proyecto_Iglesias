/* =========================================================
   CONTROLADOR · INICIO DE SESIÓN Y CREAR CUENTA
   No sabe si las cuentas son locales o de Firebase: usa el
   proveedor que haya en "cuentas" (ver modelo/cuentas.js).
   ========================================================= */

let cuentas = CuentasSupabase;
let modoAuth = "login";       // "login" o "registro"
let dentro = false;           // ¿ya se mostró la aplicación?

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Traduce los errores de las cuentas al español. */
function traducirError(codigo) {
  return {
    "invalid_credentials": "Correo o contraseña incorrectos.",
    "email_not_confirmed": "Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión.",
    "user_already_exists": "Ya existe una cuenta con ese correo. Inicia sesión.",
    "email_exists": "Ya existe una cuenta con ese correo. Inicia sesión.",
    "weak_password": "La contraseña es muy débil. Usa al menos 6 caracteres.",
    "auth/password-mismatch": "Las contraseñas no coinciden.",
    "over_email_send_rate_limit": "Se enviaron demasiados correos. Espera unos minutos.",
    "auth/delete-not-configured": "La eliminación segura de cuentas todavía requiere configurar una Edge Function.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/user-disabled": "Esta cuenta fue desactivada.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
    "auth/weak-password": "La contraseña es muy débil (mínimo 6 caracteres).",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.",
    "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google.",
    "local/sin-cuenta": "No existe una cuenta con ese correo. Créala en la pestaña \"Crear cuenta\".",
    "local/sin-google": "Para entrar con Google hay que conectar Firebase. Por ahora entra con tu correo y contraseña.",
    "local/sin-correo": "El cambio de contraseña por correo todavía no está activado en esta página.",
    "almacen/sin-espacio": "No se pudo guardar: el navegador no tiene espacio."
  }[codigo] || "Ocurrió un error. Inténtalo de nuevo.";
}

/** Revisa el formulario antes de enviarlo. Devuelve true si todo está bien. */
function validar({ nombre, correo, contrasena, confirmar }) {
  limpiarErrores();
  let ok = true;
  if (!correo) { marcarError("correo", "Escribe tu correo electrónico."); ok = false; }
  else if (!CORREO_VALIDO.test(correo)) { marcarError("correo", "El correo no tiene un formato válido."); ok = false; }
  if (!contrasena) { marcarError("contrasena", "Escribe tu contraseña."); ok = false; }
  else if (contrasena.length < 6) { marcarError("contrasena", "Debe tener al menos 6 caracteres."); ok = false; }
  if (modoAuth === "registro" || modoAuth === "recuperar") {
    if (modoAuth === "registro" && nombre.length < 2) { marcarError("nombre", "Escribe tu nombre."); ok = false; }
    if (confirmar !== contrasena) { marcarError("confirmar", "Las contraseñas no coinciden."); ok = false; }
  }
  return ok;
}

function cambiarModo(modo) {
  modoAuth = modo;
  pintarModoAuth(modo);
}

/** Envía el formulario: inicia sesión o crea la cuenta. */
async function enviarFormulario(e) {
  e.preventDefault();
  const datos = leerFormularioAuth();
  if (!validar(datos)) return;
  bloquearAuth(true);
  try {
    if (modoAuth === "recuperar" && datos.confirmar !== datos.contrasena) {
      marcarError("confirmar", "Las contraseñas no coinciden.");
      return;
    }
    const usuario = modoAuth === "recuperar"
      ? await cuentas.cambiarContrasena(datos.contrasena)
      : modoAuth === "registro" ? await cuentas.registrar(datos) : await cuentas.iniciarSesion(datos);
    if (usuario?.requiereConfirmacion) {
      cambiarModo("login");
      mensajeAuth("Te enviamos un correo de confirmación. Confirma tu cuenta y luego inicia sesión.", true);
    } else if (usuario) {
      await Perfiles.cargar(usuario);
      if (modoAuth === "recuperar") {
        cambiarModo("login");
        mensajeAuth("Contraseña actualizada. Ya puedes entrar con ella.", true);
      }
      entrar(usuario);
    }
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  } finally {
    bloquearAuth(false);
  }
}

async function entrarConGoogle() {
  bloquearAuth(true);
  mensajeAuth("");
  try {
    entrar(await cuentas.entrarConGoogle());
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  } finally {
    bloquearAuth(false);
  }
}

/** Envía a tu correo un enlace para cambiar la contraseña (la única forma de cambiarla). */
async function recuperarContrasena() {
  limpiarErrores();
  const { correo } = leerFormularioAuth();
  if (!correo) return marcarError("correo", "Escribe tu correo para enviarte el enlace.");
  if (!CORREO_VALIDO.test(correo)) return marcarError("correo", "El correo no tiene un formato válido.");
  try {
    await cuentas.recuperarContrasena(correo);
    // Firebase no revela si el correo tiene cuenta
    mensajeAuth("Si ese correo tiene una cuenta, te enviamos un enlace para cambiar tu contraseña. Revisa también la carpeta de spam.", true);
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  }
}

/** Pone el nombre y la foto del usuario en la navbar (y en el perfil si está abierto). */
function refrescarUsuario() {
  if (!estado.usuario) return;
  const perfil = Perfiles.leer(estado.usuario.email);
  pintarUsuario(nombreDeUsuario(estado.usuario), perfil.foto || estado.usuario.photoURL);
  if (!$("vista-perfil").hidden) mostrarPerfil();
}

/** Guarda al usuario y muestra la aplicación con la animación de entrada. */
function entrar(usuario) {
  estado.usuario = usuario;
  refrescarUsuario();
  gestionAlEntrar(usuario); // lee el rol (profiles) y muestra el enlace "Gestión" si tiene uno
  if (dentro) return;
  dentro = true;
  animarEntrada(() => {
    pintarCarrusel(estado.actual); // recalcula posiciones ahora que la app es visible
    iniciarMapa();
    programarAvance(); // el carrusel empieza a moverse solo
  });
}

/** Regresa a la pantalla de inicio de sesión. */
function mostrarLogin() {
  dentro = false;
  estado.usuario = null;
  detenerAvance();
  gestionAlSalir();
  salirDeVistaPrivada();
  modoAuth = "login";
  pintarPantallaLogin();
}

async function cerrarSesion() {
  try {
    await cuentas.cerrarSesion(); // con Firebase, alCambiarSesion también llamará a mostrarLogin
  } finally {
    mostrarLogin();
  }
}

function conectarAuth() {
  prepararVideoLogin();
  $("tab-login").addEventListener("click", () => cambiarModo("login"));
  $("tab-registro").addEventListener("click", () => cambiarModo("registro"));
  $("form-auth").addEventListener("submit", enviarFormulario);
  $("btn-google").addEventListener("click", entrarConGoogle);
  $("btn-olvide").addEventListener("click", recuperarContrasena);
  $("btn-salir").addEventListener("click", cerrarSesion);
  $("btn-ver").addEventListener("click", alternarVerContrasena);
}

/** Conecta el login y restaura la sesión de Supabase. */
async function iniciarAuth() {
  conectarAuth();
  try {
    cuentas.alCambiarSesion((usuario, evento) => {
      if (!usuario) { mostrarLogin(); return; }
      if (evento === "PASSWORD_RECOVERY") {
        cambiarModo("recuperar");
        mensajeAuth("Escribe tu nueva contraseña para terminar la recuperación.", true);
        return;
      }
      // No ejecutar consultas Supabase dentro del callback de Auth.
      setTimeout(async () => {
        try {
          await Perfiles.cargar(usuario);
          entrar(usuario);
        } catch (error) {
          console.error(error);
          mensajeAuth("Iniciaste sesión, pero no se pudieron cargar tus datos. Revisa las tablas y las políticas RLS en Supabase.");
        }
      }, 0);
    });
  } catch (error) {
    console.error(error);
    mensajeAuth("No se pudo conectar con Supabase. Revisa tu conexión y la configuración.");
  }
}
