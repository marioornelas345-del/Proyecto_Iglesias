/* =========================================================
   CONTROLADOR · RUTAS DE LA DIRECCIÓN (#libros/catedral, #perfil...)
   Decide qué vista se ve según lo que hay después del #.
   ========================================================= */
let scrollFicha = 0;         // posición de la página antes de abrir una vista
let vistaDesdeFicha = false; // ¿se llegó a la vista desde la página (y no con el enlace directo)?

/** Muestra la vista que pide la dirección o regresa a la página. */
function actualizarVista() {
  const ruta = location.hash.match(/^#(libros|arte|eventos)\/(\w+)$/);
  const t = ruta && TEMPLOS.find((x) => x.clave === ruta[2]);
  const enPerfil = location.hash === "#perfil";
  const gestion = location.hash.match(/^#gestion(?:\/(\w+))?$/);
  const main = document.querySelector("main");

  $("vista-apartado").hidden = !t;
  $("vista-perfil").hidden = !enPerfil;
  $("vista-gestion").hidden = !gestion;

  if (gestion) {
    if (!main.hidden) {
      scrollFicha = window.scrollY;
      vistaDesdeFicha = true;
    }
    main.hidden = true;
    mostrarGestion(gestion[1] || "dashboard");
    window.scrollTo(0, 0);
    $("gestion-titulo").focus({ preventScroll: true });
    return;
  }

  if (t || enPerfil) {
    if (!main.hidden) {
      scrollFicha = window.scrollY;
      vistaDesdeFicha = true;
    }
    main.hidden = true;
    if (t) {
      const i = TEMPLOS.indexOf(t);
      if (i !== estado.elegida) seleccionar(i, { desplazar: false, volar: false });
      abrirApartado(ruta[1], t);
    } else {
      mostrarPerfil();
    }
    window.scrollTo(0, 0);
    $(t ? "vista-titulo" : "perfil-titulo").focus({ preventScroll: true });
    return;
  }

  if (main.hidden) {
    main.hidden = false;
    ajustarMapa();
    // El navegador no pudo bajar al destino mientras estaba oculto
    const destino = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (destino) destino.scrollIntoView({ behavior: "auto" });
    else window.scrollTo(0, scrollFicha);
    vistaDesdeFicha = false;
  }
}

/** Regresa a la ficha de la iglesia desde un apartado. */
function volverAFicha() {
  if (vistaDesdeFicha) history.back();
  else location.hash = "#detalle"; // se abrió directo con el enlace
}

/** Regresa a donde estaba el usuario antes de abrir su perfil. */
function salirDePerfil() {
  if (vistaDesdeFicha) history.back();
  else location.hash = "#inicio"; // se abrió directo con el enlace
}

/** Regresa a donde estaba el usuario antes de abrir la gestión. */
function salirDeGestion() {
  if (vistaDesdeFicha) history.back();
  else location.hash = "#inicio";
}

/** Al cerrar sesión, el siguiente usuario no debe caer en el perfil (o la gestión) del anterior. */
function salirDeVistaPrivada() {
  if (location.hash !== "#perfil" && !location.hash.startsWith("#gestion")) return;
  history.replaceState(null, "", location.pathname + location.search);
  actualizarVista();
}

function conectarRouter() {
  window.addEventListener("hashchange", actualizarVista);
  actualizarVista();
  vistaDesdeFicha = false; // abierta directo con el enlace: "Volver" no debe salir de la página
}
