/* =========================================================
   INICIO DE SESIÓN Y CREAR CUENTA (Firebase Authentication)
   ========================================================= */

// ⚠️⚠️⚠️ PEGA AQUÍ TU CONFIGURACIÓN ⚠️⚠️⚠️
// Consola de Firebase → ⚙️ Configuración del proyecto → Tus apps → App web
const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI_TU_PROYECTO.firebaseapp.com",
  projectId: "PEGA_AQUI_TU_PROYECTO",
  storageBucket: "PEGA_AQUI_TU_PROYECTO.appspot.com",
  messagingSenderId: "PEGA_AQUI",
  appId: "PEGA_AQUI"
};
const configuracionLista = !firebaseConfig.apiKey.startsWith("PEGA");
const FIREBASE = "https://www.gstatic.com/firebasejs/10.12.2/";

let fb = null;          // { auth, ...funciones de Firebase } cuando esté cargado
let modoAuth = "login"; // "login" o "registro"
let dentro = false;     // ¿ya se mostró la aplicación?
let usuarioActual = null; // usuario que inició sesión

/** Reproduce o detiene el video de fondo (no gasta recursos con el login oculto). */
function videoLogin(activo) {
  const video = $("auth-video");
  if (activo && !reducirMovimiento) video.play().catch(() => {}); // sin video se ve la imagen fija
  else video.pause();
}

/** Funde el video a negro justo antes de que vuelva a empezar. */
function conectarVideoLogin() {
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

/** Cambia entre "Iniciar sesión" y "Crear cuenta". */
function cambiarModo(modo) {
  modoAuth = modo;
  const registro = modo === "registro";
  $("auth-titulo").textContent = registro ? "Crear cuenta" : "Iniciar sesión";
  $("auth-sub").textContent = registro
    ? "Regístrate para explorar las iglesias de Mérida."
    : "Accede para explorar las iglesias de Mérida.";
  $("btn-enviar").textContent = registro ? "Crear cuenta" : "Iniciar sesión";
  animar($("auth-encabezado"));
  animar($("btn-enviar"));
  $("campo-nombre").hidden = !registro;
  $("campo-confirmar").hidden = !registro;
  $("btn-olvide").hidden = registro;
  $("contrasena").autocomplete = registro ? "new-password" : "current-password";
  $("tab-login").classList.toggle("activa", !registro);
  $("tab-registro").classList.toggle("activa", registro);
  $("tab-login").setAttribute("aria-selected", !registro);
  $("tab-registro").setAttribute("aria-selected", registro);
  limpiarErrores();
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

/** Revisa el formulario antes de enviarlo. Devuelve true si todo está bien. */
function validar() {
  limpiarErrores();
  let ok = true;
  const correo = $("correo").value.trim();
  const contrasena = $("contrasena").value;
  if (!correo) { marcarError("correo", "Escribe tu correo electrónico."); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { marcarError("correo", "El correo no tiene un formato válido."); ok = false; }
  if (!contrasena) { marcarError("contrasena", "Escribe tu contraseña."); ok = false; }
  else if (contrasena.length < 6) { marcarError("contrasena", "Debe tener al menos 6 caracteres."); ok = false; }
  if (modoAuth === "registro") {
    if ($("nombre").value.trim().length < 2) { marcarError("nombre", "Escribe tu nombre."); ok = false; }
    if ($("confirmar").value !== contrasena) { marcarError("confirmar", "Las contraseñas no coinciden."); ok = false; }
  }
  return ok;
}

/** Traduce los errores de Firebase al español. */
function traducirError(codigo) {
  return {
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
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase.",
    "auth/operation-not-allowed": "Este método de acceso no está activado en Firebase.",
    "auth/network-request-failed": "Sin conexión a internet."
  }[codigo] || "Ocurrió un error. Inténtalo de nuevo.";
}

function bloquear(si) {
  $("btn-enviar").disabled = si;
  $("btn-google").disabled = si;
}

/* ---------------------------------------------------------
   Cuentas locales: mientras Firebase no esté configurado, las cuentas
   se guardan en este navegador (localStorage). La contraseña no se guarda
   tal cual, sino su "huella" SHA-256.
   --------------------------------------------------------- */
const CLAVE_CUENTAS = "templos-merida-cuentas";

function leerJSON(clave, porDefecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
}
/** Devuelve false si el navegador no pudo guardarlo. */
function guardarJSON(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // navegador sin almacenamiento o sin espacio
  }
}

/** Huella SHA-256 de un texto (para no guardar la contraseña tal cual). */
async function huella(texto) {
  if (window.crypto?.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) | 0;
  return "h" + h;
}

/** Crea la cuenta o inicia sesión con las cuentas guardadas en este navegador. */
async function enviarFormularioLocal() {
  const correo = $("correo").value.trim().toLowerCase();
  const clave = await huella($("contrasena").value);
  const cuentas = leerJSON(CLAVE_CUENTAS, {});

  if (modoAuth === "registro") {
    if (cuentas[correo]) return mensajeAuth(traducirError("auth/email-already-in-use"));
    cuentas[correo] = { nombre: $("nombre").value.trim(), clave, creada: new Date().toISOString() };
    guardarJSON(CLAVE_CUENTAS, cuentas);
  } else {
    if (!cuentas[correo]) return mensajeAuth("No existe una cuenta con ese correo. Créala en la pestaña \"Crear cuenta\".");
    if (cuentas[correo].clave !== clave) return mensajeAuth(traducirError("auth/wrong-password"));
  }
  entrar({ displayName: cuentas[correo].nombre, email: correo, photoURL: null, creada: cuentas[correo].creada });
}

/** Envía el formulario: inicia sesión o crea la cuenta. */
async function enviarFormulario(e) {
  e.preventDefault();
  if (!validar()) return;
  if (!fb) return enviarFormularioLocal(); // todavía sin Firebase: cuentas en este navegador
  bloquear(true);
  try {
    const correo = $("correo").value.trim();
    const contrasena = $("contrasena").value;
    if (modoAuth === "login") {
      await fb.signInWithEmailAndPassword(fb.auth, correo, contrasena);
    } else {
      const cred = await fb.createUserWithEmailAndPassword(fb.auth, correo, contrasena);
      await fb.updateProfile(cred.user, { displayName: $("nombre").value.trim() });
      pintarUsuario(cred.user);
    }
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  } finally {
    bloquear(false);
  }
}

async function entrarConGoogle() {
  if (!fb) return mensajeAuth("Para entrar con Google hay que conectar Firebase. Por ahora entra con tu correo y contraseña.");
  bloquear(true);
  mensajeAuth("");
  try {
    const proveedor = new fb.GoogleAuthProvider();
    proveedor.setCustomParameters({ prompt: "select_account" });
    await fb.signInWithPopup(fb.auth, proveedor);
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  } finally {
    bloquear(false);
  }
}

/**
 * Envía a tu correo un enlace para cambiar la contraseña. Es la única forma de
 * cambiarla: el enlace abre una página de Firebase donde se escribe la nueva.
 */
async function recuperarContrasena() {
  limpiarErrores();
  const correo = $("correo").value.trim();
  if (!correo) return marcarError("correo", "Escribe tu correo para enviarte el enlace.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return marcarError("correo", "El correo no tiene un formato válido.");
  if (!fb) return mensajeAuth("El cambio de contraseña por correo todavía no está activado en esta página.");
  try {
    await fb.sendPasswordResetEmail(fb.auth, correo);
    // Firebase no revela si el correo tiene cuenta
    mensajeAuth("Si ese correo tiene una cuenta, te enviamos un enlace para cambiar tu contraseña. Revisa también la carpeta de spam.", true);
  } catch (error) {
    mensajeAuth(traducirError(error.code));
  }
}

/** Nombre que se muestra: el del perfil, el de la cuenta o el inicio del correo. */
function nombreDeUsuario(usuario) {
  return leerPerfil().nombre || usuario.displayName || usuario.email.split("@")[0];
}

/** Muestra el nombre y la foto (o la inicial) del usuario en la navbar. */
function pintarUsuario(usuario) {
  usuarioActual = usuario;
  const nombre = nombreDeUsuario(usuario);
  const foto = leerPerfil().foto || usuario.photoURL;
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
  if (!$("vista-perfil").hidden) pintarPerfil();
}

/** Oculta el login y reproduce la animación de entrada con zoom. */
function entrar(usuario) {
  pintarUsuario(usuario);
  if (dentro) return;
  dentro = true;
  window.scrollTo(0, 0); // al entrar se ve primero la portada

  if (reducirMovimiento) {
    $("auth").hidden = true;
    videoLogin(false);
    $("app").hidden = false;
    iniciarMapa();
    programarAvance();
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
      pintar(); // recalcula posiciones ahora que la app es visible
      iniciarMapa();
      programarAvance(); // el carrusel empieza a moverse solo
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

/** Regresa a la pantalla de inicio de sesión. */
function mostrarLogin() {
  dentro = false;
  usuarioActual = null;
  clearTimeout(temporizadorAvance); // detiene el carrusel
  if (location.hash === "#perfil") { // el siguiente usuario no debe caer en este perfil
    history.replaceState(null, "", location.pathname + location.search);
    actualizarVista();
  }
  $("app").hidden = true;
  $("intro").hidden = true;
  $("auth").hidden = false;
  videoLogin(true);
  $("form-auth").reset();
  $("contrasena").type = "password";
  $("btn-ver").textContent = "Ver";
  cambiarModo("login");
  window.scrollTo(0, 0);
}

async function cerrarSesion() {
  if (!fb) return mostrarLogin(); // cuentas locales
  try {
    await fb.signOut(fb.auth); // onAuthStateChanged mostrará el login
  } catch {
    mostrarLogin();
  }
}

/** Conecta los botones del login. */
function conectarAuth() {
  conectarVideoLogin();
  // Sin Firebase no hay acceso con Google
  if (!configuracionLista) {
    $("btn-google").hidden = true;
    document.querySelector(".a-separador").hidden = true;
  }
  $("tab-login").addEventListener("click", () => cambiarModo("login"));
  $("tab-registro").addEventListener("click", () => cambiarModo("registro"));
  $("form-auth").addEventListener("submit", enviarFormulario);
  $("btn-google").addEventListener("click", entrarConGoogle);
  $("btn-olvide").addEventListener("click", recuperarContrasena);
  $("btn-salir").addEventListener("click", cerrarSesion);
  $("btn-ver").addEventListener("click", () => {
    const campo = $("contrasena");
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    $("btn-ver").textContent = mostrar ? "Ocultar" : "Ver";
  });
}

/**
 * Carga Firebase con import() dinámico. Así, si todavía no hay configuración
 * la página funciona con cuentas guardadas en el navegador.
 */
async function iniciarAuth() {
  conectarAuth();
  if (!configuracionLista) return; // siempre empieza en el inicio de sesión
  try {
    const [{ initializeApp }, modulo] = await Promise.all([
      import(FIREBASE + "firebase-app.js"),
      import(FIREBASE + "firebase-auth.js")
    ]);
    const auth = modulo.getAuth(initializeApp(firebaseConfig));
    auth.languageCode = "es";
    fb = { auth, ...modulo };
    // La sesión solo dura mientras la página está abierta: al abrirla, siempre se pide iniciar sesión
    await modulo.setPersistence(auth, modulo.inMemoryPersistence);
    // Se dispara al iniciar o cerrar sesión (y al recargar si la sesión seguía abierta)
    modulo.onAuthStateChanged(auth, (usuario) => (usuario ? entrar(usuario) : mostrarLogin()));
  } catch (error) {
    console.error(error);
    mensajeAuth("No se pudo cargar Firebase. Revisa tu conexión a internet.");
  }
}
