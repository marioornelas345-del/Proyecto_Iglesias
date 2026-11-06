/* =========================================================
   VISTA · MI PERFIL
   Lo que escribe el usuario se pone con .value y .textContent,
   nunca con innerHTML.
   ========================================================= */

function mensajePerfil(id, texto, exito = false) {
  $(id).textContent = texto;
  $(id).classList.toggle("exito", exito);
}

/** Opciones del campo "Iglesia favorita". */
function pintarOpcionesIglesia() {
  $("perfil-iglesia").insertAdjacentHTML("beforeend", TEMPLOS.map((t) => `<option value="${t.clave}">${t.tipo} ${t.nombre}</option>`).join(""));
}

/** Foto o inicial del usuario en la tarjeta del perfil. */
function pintarFotoPerfil(foto, nombre, fotoPropia) {
  $("perfil-foto").hidden = !foto;
  $("perfil-inicial").hidden = Boolean(foto);
  if (foto) $("perfil-foto").src = foto;
  $("perfil-inicial").textContent = nombre.charAt(0).toUpperCase();
  $("perfil-quitar-foto").hidden = !fotoPropia;
}

/** Contador y barra de iglesias visitadas. */
function pintarConteoVisitadas(visitadas) {
  const total = visitadas.length;
  $("perfil-conteo").textContent = `${total} de ${TEMPLOS.length}`;
  $("perfil-visitadas-campo").value = `${total} de ${TEMPLOS.length}`;
  $("perfil-barra").style.width = `${(total / TEMPLOS.length) * 100}%`;
}

/** Llena la vista con los datos del usuario. */
function pintarPerfil(usuario, perfil, nombre) {
  $("perfil-nombre-tarjeta").textContent = nombre;
  $("perfil-correo").textContent = usuario.email;
  pintarFotoPerfil(perfil.foto || usuario.photoURL, nombre, Boolean(perfil.foto));

  const favorita = TEMPLOS.find((x) => x.clave === perfil.favorita);
  $("perfil-favorita").textContent = favorita ? `${favorita.tipo} ${favorita.nombre}` : "Sin elegir";

  const creada = usuario.creada || usuario.metadata?.creationTime;
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
      ${t.foto ? `<img src="${t.miniatura}" alt="" loading="lazy" decoding="async">` : ""}
      <span>${t.tipo} ${t.nombre}</span>
    </button>`).join("");
  pintarConteoVisitadas(visitadas);
}

/** Lo que el usuario escribió en "Mis datos". */
function leerFormularioPerfil() {
  const campoLibros = $("perfil-libros");
  return {
    nombre: $("perfil-nombre").value.trim(),
    librosLeidos: campoLibros.value,
    librosInvalido: campoLibros.validity.badInput, // con texto inválido el campo numérico da "" pero marca badInput
    ciudad: $("perfil-ciudad").value.trim(),
    favorita: $("perfil-iglesia").value,
    sobre: $("perfil-sobre").value.trim()
  };
}

/* ---------- Ventana "Eliminar mi cuenta" ---------- */

/** Abre la confirmación. Si pideContrasena es false (cuenta de Google), no muestra el campo. */
function abrirConfirmarEliminar(pideContrasena) {
  $("form-eliminar").reset();
  $("eliminar-campo").hidden = !pideContrasena;
  mensajePerfil("eliminar-mensaje", "");
  bloquearEliminar(false);
  $("confirmar-eliminar").showModal();
  (pideContrasena ? $("eliminar-contrasena") : $("eliminar-cancelar")).focus();
}

function cerrarConfirmarEliminar() {
  $("confirmar-eliminar").close();
}

function bloquearEliminar(si) {
  $("eliminar-confirmar").disabled = si;
  $("eliminar-confirmar").textContent = si ? "Eliminando…" : "Eliminar cuenta";
}
