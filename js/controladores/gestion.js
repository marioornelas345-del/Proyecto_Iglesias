/* =========================================================
   CONTROLADOR · GESTIÓN DE LA IGLESIA
   Rutas: #gestion y #gestion/<modulo>. Escucha los data-accion
   y data-form de la vista, llama al modelo y vuelve a pintar.
   Expone: conectarGestion, mostrarGestion, gestionAlEntrar, gestionAlSalir.
   ========================================================= */
const ControlGestion = (() => {
  const G = GestionModelo;
  const V = GestionVista;
  const R = GestionReportes;
  const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TAMANO_LOGO = 256;

  const hoy = new Date();
  const est = {
    modulo: "dashboard",
    miembros: [], ministerios: [], eventos: [], donaciones: [], anuncios: [], usuarios: [],
    busqueda: "", estadoMiembros: "activos",
    mesEventos: new Date(hoy.getFullYear(), hoy.getMonth(), 1), modoEventos: "calendario",
    eventoAsistencia: null,
    donDesde: G.fechaISO(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), donHasta: G.fechaISO(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
    reporteTipo: "miembros", reporteOpciones: { estadoMiembro: "todos" }, reporte: null,
    usuarioCargado: null
  };
  let turno = 0; // evita pintar datos de una carga anterior

  const datosForm = (form) => Object.fromEntries(new FormData(form).entries());
  const porId = (lista, id, clave = "id") => lista.find((x) => x[clave] === id);
  const nombreIglesia = () => porId(G.sesion.iglesias, G.sesion.iglesiaId)?.name || "";

  /* ---------- Sesión ---------- */
  function pintarEnlaces() {
    const visible = !!G.sesion.perfil;
    document.querySelectorAll("[data-enlace-gestion]").forEach((a) => { a.hidden = !visible; });
  }

  async function gestionAlEntrar(usuario) {
    if (!usuario?.id || est.usuarioCargado === usuario.id) return;
    est.usuarioCargado = usuario.id;
    try {
      await G.cargarSesion(usuario);
    } catch (error) {
      console.warn("No se pudo leer el rol en profiles:", error);
    }
    pintarEnlaces();
    if (location.hash.startsWith("#gestion")) actualizarVista();
  }

  function gestionAlSalir() {
    est.usuarioCargado = null;
    est.reporte = null;
    G.limpiarSesion();
    V.cerrarDialogo();
    pintarEnlaces();
  }

  /* ---------- Mostrar un módulo ---------- */
  async function mostrarGestion(modulo = "dashboard") {
    const mio = ++turno;
    const vigente = () => mio === turno;
    V.aviso("");
    if (!estado.usuario) return V.pintarSinRol("Inicia sesión para entrar a la gestión.");
    if (!G.sesion.cargado) {
      V.pintarCargando();
      try { await G.cargarSesion(estado.usuario); est.usuarioCargado = estado.usuario.id; pintarEnlaces(); } catch (error) { console.error(error); }
      if (!vigente()) return;
    }
    if (!G.sesion.perfil) {
      return V.pintarSinRol("Tu cuenta no tiene un rol asignado (administrador, pastor, secretario, tesorero o coordinador). Pide al administrador que te registre como usuario del sistema.");
    }
    if (!G.sesion.iglesiaId && G.sesion.perfil.rol !== "administrador") return V.pintarSinRol("Tu usuario no tiene una iglesia asignada.");
    if (!G.puede(modulo)) modulo = "dashboard";
    est.modulo = modulo;
    V.pintarMarco({ perfil: G.sesion.perfil, modulos: G.modulosVisibles(), actual: modulo, iglesias: G.sesion.iglesias, iglesiaId: G.sesion.iglesiaId });
    if (!G.sesion.iglesiaId) return V.pintarSinRol("Todavía no hay iglesias registradas en la tabla churches.");
    V.pintarCargando();
    try {
      await CARGAS[modulo](vigente);
    } catch (error) {
      console.error(error);
      if (vigente()) { V.aviso(G.mensajeError(error)); V.pintarSinRol(G.mensajeError(error)); }
    }
  }
  const recargar = () => mostrarGestion(est.modulo);

  const CARGAS = {
    async dashboard(vigente) {
      const datos = await G.datosPanel();
      if (vigente()) V.pintarPanel(datos);
    },
    async miembros(vigente) {
      est.miembros = await G.listarMiembros();
      if (!vigente()) return;
      V.pintarMiembros({ editable: G.puede("miembros", "editar"), busqueda: est.busqueda, estadoFiltro: est.estadoMiembros });
      filtrarMiembros();
    },
    async eventos(vigente) {
      const inicio = G.inicioSemana(est.mesEventos);
      const fin = new Date(inicio); fin.setDate(fin.getDate() + 42);
      const [miembros, ministerios, eventos] = await Promise.all([G.listarMiembros(), G.listarMinisterios(), G.listarEventos({ desde: inicio.toISOString(), hasta: fin.toISOString() })]);
      Object.assign(est, { miembros, ministerios, eventos });
      if (!vigente()) return;
      const delMes = eventos.filter((e) => new Date(e.starts_at).getMonth() === est.mesEventos.getMonth());
      V.pintarEventos({ eventos: est.modoEventos === "lista" ? delMes : eventos, editable: G.puede("eventos", "editar"), modo: est.modoEventos, mes: est.mesEventos, miembros, ministerios });
    },
    async asistencia(vigente) {
      const [miembros, eventos, registros] = await Promise.all([G.listarMiembros(), G.listarEventos(), G.asistenciaPeriodo()]);
      Object.assign(est, { miembros, eventos });
      if (!est.eventoAsistencia || !porId(eventos, est.eventoAsistencia)) {
        const pasados = eventos.filter((e) => new Date(e.starts_at) <= new Date() && e.status !== "cancelado");
        est.eventoAsistencia = (pasados[pasados.length - 1] || eventos[0])?.id || null;
      }
      const marcas = est.eventoAsistencia ? await G.asistenciaDeEvento(est.eventoAsistencia) : [];
      const conMarca = new Set(marcas.map((m) => m.member_id));
      const historial = new Map();
      registros.forEach((r) => {
        const h = historial.get(r.event_id) || { id: r.event_id, title: r.events.title, starts_at: r.events.starts_at, presentes: 0, ausentes: 0 };
        if (r.present) h.presentes++; else h.ausentes++;
        historial.set(r.event_id, h);
      });
      if (!vigente()) return;
      V.pintarAsistencia({
        eventos, eventoId: est.eventoAsistencia, marcas, editable: G.puede("asistencia", "editar"),
        // se pasa lista a los activos y a quien ya tenía marca en ese evento
        miembros: miembros.filter((m) => m.is_active || conMarca.has(m.id)),
        historial: [...historial.values()].sort((a, b) => b.starts_at.localeCompare(a.starts_at))
      });
    },
    async ministerios(vigente) {
      const [miembros, ministerios, eventos] = await Promise.all([G.listarMiembros(), G.listarMinisterios(), G.listarEventos({ desde: new Date().toISOString() })]);
      Object.assign(est, { miembros, ministerios });
      if (vigente()) V.pintarMinisterios({ ministerios, miembros, eventos, editable: G.puede("ministerios", "editar") });
    },
    async donaciones(vigente) {
      const [miembros, donaciones] = await Promise.all([G.listarMiembros(), G.listarDonaciones({ desde: est.donDesde, hasta: est.donHasta })]);
      Object.assign(est, { miembros, donaciones });
      if (!vigente()) return;
      V.pintarDonaciones({
        donaciones, resumen: G.resumenDonaciones(donaciones), desde: est.donDesde, hasta: est.donHasta,
        editable: G.puede("donaciones", "editar"), porMes: [...G.totalesPorMes(donaciones).entries()].sort((a, b) => b[0].localeCompare(a[0]))
      });
    },
    async anuncios(vigente) {
      est.anuncios = await G.listarAnuncios();
      if (vigente()) V.pintarAnuncios({ anuncios: est.anuncios, editable: G.puede("anuncios", "editar") });
    },
    async reportes(vigente) {
      est.eventos = await G.listarEventos();
      if (!R.tiposVisibles().some(([t]) => t === est.reporteTipo)) est.reporteTipo = "miembros";
      if (vigente()) pintarReportes();
    },
    async configuracion(vigente) {
      const ig = await G.leerIglesia();
      if (vigente()) V.pintarConfiguracion(ig, G.puede("configuracion", "editar"), G.reunionesDe(ig.opening_hours));
    },
    async usuarios(vigente) {
      est.usuarios = await G.listarUsuarios();
      if (vigente()) V.pintarUsuarios({ usuarios: est.usuarios, iglesias: G.sesion.iglesias, yo: G.sesion.perfil.userId });
    }
  };

  function filtrarMiembros() {
    const q = normalizar(est.busqueda.trim());
    const lista = est.miembros.filter((m) =>
      (est.estadoMiembros === "todos" || (est.estadoMiembros === "activos" ? m.is_active : !m.is_active)) &&
      (!q || normalizar(m.full_name).includes(q)));
    V.pintarTablaMiembros(lista, G.puede("miembros", "editar"));
  }
  const pintarReportes = () => V.pintarReportes({ tipos: R.tiposVisibles(), tipo: est.reporteTipo, opciones: est.reporteOpciones, eventos: est.eventos, reporte: est.reporte });

  /* ---------- Guardar formularios ---------- */
  /** Ejecuta un guardado con mensajes y bloqueo del botón. */
  async function guardar(form, accion, exito) {
    V.bloquearFormulario(form, true);
    try {
      await accion();
      V.cerrarDialogo();
      await recargar();
      V.aviso(exito, true);
    } catch (error) {
      console.error(error);
      V.mensajeFormulario(form, G.mensajeError(error));
    } finally {
      V.bloquearFormulario(form, false);
    }
  }
  const falta = (form, texto) => { V.mensajeFormulario(form, texto); return true; };

  const FORMULARIOS = {
    miembro(form, d) {
      if ((d.full_name || "").trim().length < 2) return falta(form, "Escribe el nombre completo.");
      if (d.email && !CORREO.test(d.email)) return falta(form, "El correo no tiene un formato válido.");
      if (!d.joined_on) return falta(form, "Elige la fecha de ingreso.");
      return guardar(form, () => G.guardarMiembro({ ...d, full_name: d.full_name.trim(), is_active: d.is_active === "on" }), d.id ? "Miembro actualizado." : "Miembro registrado.");
    },
    evento(form, d) {
      if ((d.title || "").trim().length < 2) return falta(form, "Escribe el título del evento.");
      if (!d.fecha || !d.hora) return falta(form, "Elige la fecha y la hora del evento.");
      if (d.hora_fin && d.hora_fin < d.hora) return falta(form, "La hora de término debe ser después del inicio.");
      const responsables = new FormData(form).getAll("responsables");
      return guardar(form, () => G.guardarEvento({ ...d, title: d.title.trim() }, responsables), d.id ? "Evento actualizado." : "Evento creado.");
    },
    asistencia(form) {
      const marcas = [...form.querySelectorAll('input[type=radio]:checked')].map((r) => ({ member_id: r.name.slice(2), present: r.value === "1" }));
      if (!marcas.length) return falta(form, "Marca al menos a un miembro.");
      return guardar(form, () => G.guardarAsistencia(est.eventoAsistencia, marcas), `Asistencia guardada (${marcas.length} registros).`);
    },
    ministerio(form, d) {
      if ((d.name || "").trim().length < 2) return falta(form, "Escribe el nombre del ministerio.");
      const integrantes = new FormData(form).getAll("integrantes");
      if (d.coordinator_member_id && !integrantes.includes(d.coordinator_member_id)) integrantes.push(d.coordinator_member_id);
      return guardar(form, () => G.guardarMinisterio({ ...d, name: d.name.trim() }, integrantes), d.id ? "Ministerio actualizado." : "Ministerio creado.");
    },
    donacion(form, d) {
      if (!(Number(d.amount) > 0)) return falta(form, "El monto debe ser mayor a cero.");
      if ((d.concept || "").trim().length < 2) return falta(form, "Escribe el concepto.");
      if (!d.donated_on) return falta(form, "Elige la fecha.");
      return guardar(form, () => G.guardarDonacion({ ...d, concept: d.concept.trim(), is_anonymous: d.is_anonymous === "on" }), d.id ? "Aportación actualizada." : "Aportación registrada.");
    },
    "filtro-donaciones"(form, d) {
      if (d.desde && d.hasta && d.hasta < d.desde) return falta(form, "La fecha final debe ser después de la inicial.");
      est.donDesde = d.desde || null;
      est.donHasta = d.hasta || null;
      return recargar();
    },
    anuncio(form, d) {
      if ((d.title || "").trim().length < 2) return falta(form, "Escribe el título.");
      if ((d.body || "").trim().length < 2) return falta(form, "Escribe el texto del anuncio.");
      if (d.expires_on && d.expires_on < d.published_on) return falta(form, "La fecha de vigencia debe ser después de la publicación.");
      return guardar(form, () => G.guardarAnuncio({ ...d, title: d.title.trim(), body: d.body.trim(), is_important: d.is_important === "on", is_public: d.is_public === "on" }), d.id ? "Anuncio actualizado." : "Anuncio publicado.");
    },
    async reporte(form, d) {
      est.reporteTipo = d.tipo;
      est.reporteOpciones = { ...est.reporteOpciones, ...d };
      if (d.tipo === "asistencia-evento" && !d.eventoId) return falta(form, "Elige un evento.");
      if (d.desde && d.hasta && d.hasta < d.desde) return falta(form, "La fecha final debe ser después de la inicial.");
      V.bloquearFormulario(form, true);
      try {
        est.reporte = await R.generar(d.tipo, { ...est.reporteOpciones, eventos: est.eventos });
        est.reporte.tipo = d.tipo;
        pintarReportes();
      } catch (error) {
        console.error(error);
        V.aviso(G.mensajeError(error));
      } finally {
        V.bloquearFormulario(form, false);
      }
    },
    iglesia(form, d) {
      if ((d.name || "").trim().length < 2) return falta(form, "Escribe el nombre de la iglesia.");
      if (d.contact_email && !CORREO.test(d.contact_email)) return falta(form, "El correo no tiene un formato válido.");
      const reuniones = [...form.querySelectorAll(".g-reunion")].map((fila) => ({
        dia: fila.querySelector('[name="r_dia"]').value,
        hora: fila.querySelector('[name="r_hora"]').value,
        actividad: fila.querySelector('[name="r_actividad"]').value.trim()
      })).filter((r) => r.hora || r.actividad);
      return guardar(form, () => G.guardarIglesia({ ...d, name: d.name.trim(), reuniones }), "Información de la iglesia guardada.");
    },
    "usuario-nuevo"(form, d) {
      if ((d.full_name || "").trim().length < 2) return falta(form, "Escribe el nombre.");
      if (!CORREO.test(d.email || "")) return falta(form, "Escribe un correo válido.");
      if ((d.password || "").length < 6) return falta(form, "La contraseña debe tener al menos 6 caracteres.");
      if (d.app_role !== "administrador" && !d.church_id) return falta(form, "Elige la iglesia del usuario (solo el administrador puede no tener iglesia).");
      V.bloquearFormulario(form, true);
      (async () => {
        try {
          const r = await G.registrarUsuario({ ...d, full_name: d.full_name.trim() });
          V.cerrarDialogo();
          await recargar();
          V.aviso(r.requiereConfirmacion ? "Usuario registrado. Debe confirmar su correo antes de entrar." : "Usuario registrado.", true);
        } catch (error) {
          console.error(error);
          V.mensajeFormulario(form, G.mensajeError(error));
        } finally {
          V.bloquearFormulario(form, false);
        }
      })();
      return true;
    },
    usuario(form, d) {
      if ((d.full_name || "").trim().length < 2) return falta(form, "Escribe el nombre.");
      if (d.app_role !== "administrador" && !d.church_id) return falta(form, "Elige la iglesia del usuario.");
      const activo = d.is_active === "on";
      if (d.user_id === G.sesion.perfil.userId && (d.app_role !== "administrador" || !activo) &&
        !confirm("Vas a quitarte el rol de administrador o desactivarte. Perderás el acceso a esta pantalla. ¿Continuar?")) return true;
      return guardar(form, () => G.guardarUsuario({ ...d, full_name: d.full_name.trim(), is_active: activo }), "Usuario actualizado.");
    }
  };

  /* ---------- Acciones de botones ---------- */
  async function accionRapida(pregunta, accion, exito) {
    if (pregunta && !confirm(pregunta)) return;
    try {
      await accion();
      await recargar();
      V.aviso(exito, true);
    } catch (error) {
      console.error(error);
      V.aviso(G.mensajeError(error));
    }
  }
  function moverMes(delta) {
    est.mesEventos = delta === 0 ? new Date(hoy.getFullYear(), hoy.getMonth(), 1) : new Date(est.mesEventos.getFullYear(), est.mesEventos.getMonth() + delta, 1);
    recargar();
  }
  function periodoDonaciones(clave) {
    const d = new Date();
    const rango = {
      mes: [new Date(d.getFullYear(), d.getMonth(), 1), new Date(d.getFullYear(), d.getMonth() + 1, 0)],
      "mes-pasado": [new Date(d.getFullYear(), d.getMonth() - 1, 1), new Date(d.getFullYear(), d.getMonth(), 0)],
      anio: [new Date(d.getFullYear(), 0, 1), new Date(d.getFullYear(), 11, 31)],
      todo: [null, null]
    }[clave];
    [est.donDesde, est.donHasta] = rango.map((f) => (f ? G.fechaISO(f) : null));
    recargar();
  }
  function abrirEvento(id, fecha) {
    const e = id ? porId(est.eventos, id) : {};
    const editable = G.puede("eventos", "editar");
    V.abrirDialogo(id ? (editable ? "Editar evento" : "Detalle del evento") : "Nuevo evento",
      V.formEvento(e || {}, { miembros: est.miembros, ministerios: est.ministerios, editable, fecha }));
  }
  async function exportar(formato) {
    if (!est.reporte) return;
    if (R.esFinanciero(est.reporte.tipo) && !G.veFinanzas()) return V.aviso("No tienes permiso para exportar información financiera.");
    V.aviso("Preparando el archivo…", true);
    try {
      await (formato === "pdf" ? GestionExportar.pdf : GestionExportar.excel)(est.reporte, nombreIglesia());
      V.aviso("Archivo descargado.", true);
    } catch (error) {
      console.error(error);
      V.aviso(error.message || "No se pudo generar el archivo.");
    }
  }

  const ACCIONES = {
    "cerrar-dialogo": () => V.cerrarDialogo(),
    "nuevo-miembro": () => V.abrirDialogo("Nuevo miembro", V.formMiembro()),
    "editar-miembro": (id) => V.abrirDialogo("Editar miembro", V.formMiembro(porId(est.miembros, id))),
    "desactivar-miembro": (id) => accionRapida(`¿Desactivar a ${porId(est.miembros, id)?.full_name}? El registro se conserva y se puede reactivar.`, () => G.cambiarActivoMiembro(id, false), "Miembro desactivado."),
    "activar-miembro": (id) => accionRapida(null, () => G.cambiarActivoMiembro(id, true), "Miembro reactivado."),
    "nuevo-evento": (fecha) => abrirEvento(null, fecha),
    "ver-evento": (id) => abrirEvento(id),
    "cancelar-evento": (id) => accionRapida(`¿Cancelar el evento “${porId(est.eventos, id)?.title}”?`, () => G.cambiarEstadoEvento(id, "cancelado"), "Evento cancelado."),
    "vista-eventos": (modo) => { est.modoEventos = modo; recargar(); },
    "mes-anterior": () => moverMes(-1),
    "mes-siguiente": () => moverMes(1),
    "mes-hoy": () => moverMes(0),
    "marcar-todos": (valor) => {
      document.querySelectorAll(`[data-form="asistencia"] input[type=radio][value="${valor}"]`).forEach((r) => { r.checked = true; });
      V.actualizarConteoAsistencia();
    },
    "ver-asistencia": (id) => { est.eventoAsistencia = id; recargar(); },
    "nuevo-ministerio": () => V.abrirDialogo("Nuevo ministerio", V.formMinisterio({}, est.miembros)),
    "editar-ministerio": (id) => V.abrirDialogo("Editar ministerio", V.formMinisterio(porId(est.ministerios, id), est.miembros)),
    "eliminar-ministerio": (id) => accionRapida(`¿Eliminar el ministerio “${porId(est.ministerios, id)?.name}”? Sus integrantes no se borran.`, () => G.eliminarMinisterio(id), "Ministerio eliminado."),
    "nueva-donacion": () => { V.abrirDialogo("Registrar aportación", V.formDonacion({}, est.miembros.filter((m) => m.is_active))); sincronizarAnonimo(); },
    "editar-donacion": (id) => { V.abrirDialogo("Editar aportación", V.formDonacion(porId(est.donaciones, id), est.miembros)); sincronizarAnonimo(); },
    "eliminar-donacion": (id) => accionRapida("¿Eliminar esta aportación? No se puede deshacer.", () => G.eliminarDonacion(id), "Aportación eliminada."),
    "periodo-donaciones": periodoDonaciones,
    "nuevo-anuncio": () => V.abrirDialogo("Nuevo anuncio", V.formAnuncio()),
    "editar-anuncio": (id) => V.abrirDialogo("Editar anuncio", V.formAnuncio(porId(est.anuncios, id))),
    "eliminar-anuncio": (id) => accionRapida(`¿Eliminar el anuncio “${porId(est.anuncios, id)?.title}”?`, () => G.eliminarAnuncio(id), "Anuncio eliminado."),
    "exportar-pdf": () => exportar("pdf"),
    "exportar-excel": () => exportar("excel"),
    "elegir-logo": () => $("g-logo-archivo")?.click(),
    "quitar-logo": () => V.pintarLogo(""),
    "agregar-reunion": () => V.agregarFilaReunion(),
    "nuevo-usuario": () => V.abrirDialogo("Registrar usuario del sistema", V.formUsuario({}, G.sesion.iglesias, true)),
    "editar-usuario": (id) => V.abrirDialogo("Editar usuario", V.formUsuario(porId(est.usuarios, id, "user_id"), G.sesion.iglesias, false))
  };

  /** En una aportación anónima no se elige donante. */
  function sincronizarAnonimo() {
    const form = document.querySelector('[data-form="donacion"]');
    if (!form) return;
    const anonimo = form.elements.is_anonymous.checked;
    form.elements.donor_member_id.disabled = anonimo;
    if (anonimo) form.elements.donor_member_id.value = "";
  }

  /** Reduce el logotipo a máximo 256 px (PNG, conserva transparencia). */
  async function reducirLogo(archivo) {
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      await new Promise((listo, fallo) => { img.onload = listo; img.onerror = fallo; img.src = url; });
      const escala = Math.min(1, TAMANO_LOGO / Math.max(img.naturalWidth, img.naturalHeight));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.naturalWidth * escala);
      lienzo.height = Math.round(img.naturalHeight * escala);
      lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);
      return lienzo.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /* ---------- Escuchas ---------- */
  function alClic(e) {
    const b = e.target.closest("[data-accion]");
    if (!b || !ACCIONES[b.dataset.accion]) return;
    if (b.dataset.accion === "quitar-reunion") return;
    e.preventDefault();
    ACCIONES[b.dataset.accion](b.dataset.id);
  }
  function alEnviar(e) {
    const form = e.target.closest("form[data-form]");
    if (!form || !FORMULARIOS[form.dataset.form]) return;
    e.preventDefault();
    FORMULARIOS[form.dataset.form](form, datosForm(form));
  }
  async function alCambiar(e) {
    const t = e.target;
    if (t.id === "gestion-iglesia") { G.elegirIglesia(t.value); est.reporte = null; est.eventoAsistencia = null; return recargar(); }
    if (t.id === "g-logo-archivo") {
      const archivo = t.files[0];
      t.value = "";
      if (!archivo) return;
      try { V.pintarLogo(await reducirLogo(archivo)); } catch { V.aviso("No se pudo usar esa imagen. Prueba con otra."); }
      return;
    }
    if (t.name === "is_anonymous" && t.closest('[data-form="donacion"]')) return sincronizarAnonimo();
    if (t.type === "radio" && t.closest('[data-form="asistencia"]')) return V.actualizarConteoAsistencia();
    const cambio = t.dataset.cambio;
    if (cambio === "estado-miembros") { est.estadoMiembros = t.value; filtrarMiembros(); }
    if (cambio === "evento-asistencia") { est.eventoAsistencia = t.value || null; recargar(); }
    if (cambio === "tipo-reporte") { est.reporteTipo = t.value; est.reporte = null; pintarReportes(); }
  }
  function alEscribir(e) {
    if (e.target.dataset.filtro === "busqueda") { est.busqueda = e.target.value; filtrarMiembros(); }
  }

  function conectarGestion() {
    const vista = $("vista-gestion");
    const dialogo = $("gestion-dialogo");
    [vista, dialogo].forEach((zona) => {
      zona.addEventListener("click", alClic);
      zona.addEventListener("submit", alEnviar);
      zona.addEventListener("change", alCambiar);
      zona.addEventListener("input", alEscribir);
    });
    // Quitar una fila de horario (no recarga nada)
    vista.addEventListener("click", (e) => {
      const b = e.target.closest('[data-accion="quitar-reunion"]');
      if (b) { e.preventDefault(); b.closest(".g-reunion")?.remove(); }
    });
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) V.cerrarDialogo(); }); // clic fuera
    $("gestion-volver").addEventListener("click", salirDeGestion);
  }

  return { conectarGestion, mostrarGestion, gestionAlEntrar, gestionAlSalir };
})();

const { conectarGestion, mostrarGestion, gestionAlEntrar, gestionAlSalir } = ControlGestion;
