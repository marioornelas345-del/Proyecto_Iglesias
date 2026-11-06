/* =========================================================
   VISTA · GESTIÓN DE LA IGLESIA
   Solo dibuja lo que recibe. Todo texto del usuario se pone con
   textContent / value (la función n() nunca usa innerHTML).
   Los botones llevan data-accion y data-id; el controlador escucha.
   ========================================================= */
const GestionVista = (() => {
  const G = GestionModelo;

  /** Crea un elemento: n("p", { class: "x", text: "hola" }, hijo1, hijo2). */
  function n(etiqueta, props, ...hijos) {
    const e = document.createElement(etiqueta);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k === "dataset") Object.assign(e.dataset, v);
      else if (["value", "checked", "selected", "disabled", "readOnly", "required", "multiple"].includes(k)) e[k] = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    hijos.flat(Infinity).forEach((h) => { if (h != null && h !== false) e.append(h instanceof Node ? h : String(h)); });
    return e;
  }
  const boton = (texto, accion, id, clase = "g-btn") => n("button", { type: "button", class: clase, dataset: { accion, ...(id != null ? { id } : {}) }, text: texto });
  const vacio = (texto) => n("p", { class: "g-vacio", text: texto });

  /* ---------- Campos de formulario ---------- */
  function campo(etiqueta, props = {}, { ancho = false, ayuda } = {}) {
    const control = props.tipo === "textarea"
      ? n("textarea", { ...props, tipo: null })
      : n("input", { type: "text", ...props, tipo: null });
    if (props.tipo === "textarea" && props.value != null) control.value = props.value;
    return n("label", { class: "g-campo" + (ancho ? " ancho" : "") }, n("span", { text: etiqueta }), control, ayuda && n("small", { text: ayuda }));
  }
  function selector(etiqueta, name, opciones, valor, { ancho = false, vacioTexto, cambio, extra = {} } = {}) {
    const s = n("select", { name, ...extra, dataset: cambio ? { cambio } : undefined },
      vacioTexto != null && n("option", { value: "", text: vacioTexto }),
      opciones.map(([v, t]) => n("option", { value: v, text: t, selected: String(v) === String(valor ?? "") })));
    return n("label", { class: "g-campo" + (ancho ? " ancho" : "") }, n("span", { text: etiqueta }), s);
  }
  const casilla = (etiqueta, name, marcada) =>
    n("label", { class: "g-casilla" }, n("input", { type: "checkbox", name, checked: !!marcada }), n("span", { text: etiqueta }));

  /** Lista de casillas para elegir miembros (responsables, integrantes). */
  function listaMiembros(etiqueta, name, miembros, elegidos) {
    const set = new Set(elegidos || []);
    return n("fieldset", { class: "g-campo ancho g-checklist" },
      n("legend", { text: etiqueta }),
      miembros.length
        ? n("div", { class: "g-checklist-caja" }, miembros.map((m) =>
          n("label", { class: "g-casilla" }, n("input", { type: "checkbox", name, value: m.id, checked: set.has(m.id) }), n("span", { text: m.full_name }))))
        : vacio("Primero registra miembros activos."));
  }
  const acciones = (...botones) => n("div", { class: "g-form-acciones" }, n("p", { class: "g-form-mensaje", role: "alert" }), ...botones);
  const enviar = (texto = "Guardar") => n("button", { type: "submit", class: "g-btn g-btn-principal", text: texto });

  /* ---------- Tabla genérica ---------- */
  function tabla(columnas, filas, { clase = "" } = {}) {
    return n("div", { class: "g-tabla-caja" },
      n("table", { class: "g-tabla " + clase },
        n("thead", null, n("tr", null, columnas.map((c) => n("th", { scope: "col", text: c })))),
        n("tbody", null, filas.map((f) => n("tr", null, f.map((celda) => n("td", null, celda)))))));
  }
  const etiqueta = (texto, tipo = "") => n("span", { class: "g-etiqueta " + tipo, text: texto });

  /* ---------- Marco: módulos, iglesia y avisos ---------- */
  function pintarMarco({ perfil, modulos, actual, iglesias, iglesiaId }) {
    $("gestion-sub").textContent = `${perfil.nombre} · ${G.nombreRol(perfil.rol)}`;
    $("gestion-modulos").replaceChildren(...modulos.map(([clave, texto]) =>
      n("a", { href: `#gestion/${clave}`, class: "g-modulo" + (clave === actual ? " activo" : ""), "aria-current": clave === actual ? "page" : null, text: texto })));
    const esAdmin = perfil.rol === "administrador" && iglesias.length > 1;
    $("gestion-iglesia-campo").hidden = !esAdmin;
    if (esAdmin) $("gestion-iglesia").replaceChildren(...iglesias.map((i) => n("option", { value: i.id, text: i.name, selected: i.id === iglesiaId })));
  }
  function pintarSinRol(texto) {
    $("gestion-sub").textContent = "";
    $("gestion-modulos").replaceChildren();
    $("gestion-iglesia-campo").hidden = true;
    $("gestion-contenido").replaceChildren(n("div", { class: "g-tarjeta g-sin-rol" },
      n("h3", { text: "Sin acceso a la gestión" }), n("p", { text: texto })));
  }
  const pintarCargando = () => $("gestion-contenido").replaceChildren(n("p", { class: "g-cargando", text: "Cargando…" }));
  function aviso(texto, exito = false) {
    $("gestion-aviso").textContent = texto;
    $("gestion-aviso").classList.toggle("exito", exito);
  }
  const contenido = (...hijos) => $("gestion-contenido").replaceChildren(...hijos);
  const encabezado = (titulo, texto, ...botones) =>
    n("div", { class: "g-encabezado" }, n("div", null, n("h3", { text: titulo }), texto && n("p", { text: texto })), n("div", { class: "g-encabezado-botones" }, ...botones));

  /* ---------- Diálogo para crear / editar ---------- */
  function abrirDialogo(titulo, formulario) {
    const d = $("gestion-dialogo");
    d.replaceChildren(
      n("div", { class: "g-dialogo-cabeza" }, n("h3", { id: "gestion-dialogo-titulo", text: titulo }),
        n("button", { type: "button", class: "g-cerrar", dataset: { accion: "cerrar-dialogo" }, "aria-label": "Cerrar", text: "×" })),
      formulario);
    if (!d.open) d.showModal();
    formulario.querySelector("input:not([type=hidden]), select, textarea")?.focus();
  }
  const cerrarDialogo = () => { if ($("gestion-dialogo").open) $("gestion-dialogo").close(); };
  function mensajeFormulario(form, texto, exito = false) {
    const p = form?.querySelector(".g-form-mensaje");
    if (!p) return aviso(texto, exito);
    p.textContent = texto;
    p.classList.toggle("exito", exito);
  }
  function bloquearFormulario(form, si) {
    form?.querySelectorAll("button[type=submit]").forEach((b) => { b.disabled = si; });
  }

  /* ---------- Gráfica de barras (una sola serie, con tooltip) ---------- */
  function barras(titulo, datos, formato = (v) => String(v)) {
    const max = Math.max(1, ...datos.map((d) => d.valor));
    const resumen = datos.map((d) => `${d.etiqueta}: ${formato(d.valor)}`).join("; ");
    return n("figure", { class: "g-grafica" },
      n("figcaption", { text: titulo }),
      datos.length && datos.some((d) => d.valor > 0)
        ? n("div", { class: "g-barras", role: "img", "aria-label": `${titulo}. ${resumen}` },
          n("span", { class: "g-barras-max", text: formato(max) }),
          datos.map((d) => n("div", { class: "g-barra-col", tabindex: "0", "data-tip": `${d.etiqueta}: ${formato(d.valor)}` },
            n("span", { class: "g-barra", style: `height:${Math.max(d.valor ? 2 : 0, (d.valor / max) * 100)}%` }),
            n("span", { class: "g-barra-etiqueta", text: d.corta || d.etiqueta }))))
        : vacio("Todavía no hay datos para graficar."));
  }

  /* ---------- RF-08 · Panel principal ---------- */
  function pintarPanel(d) {
    const tiles = [
      ["Miembros activos", d.miembrosActivos, `${d.miembrosInactivos} ${d.miembrosInactivos === 1 ? "inactivo" : "inactivos"}`],
      ["Eventos próximos", d.proximos.length, d.proximos[0] ? `Siguiente: ${G.fechaLarga(d.proximos[0].starts_at)}` : "Sin eventos programados"],
      ["Asistencias registradas", d.asistencias, "Presentes en todos los eventos"],
      ["Ministerios", d.ministerios, "Grupos de trabajo"]
    ];
    if (d.finanzas) tiles.push(["Ingresos del mes", G.dinero(d.finanzas.mesActual), `Últimos 6 meses: ${G.dinero(d.finanzas.seisMeses)}`]);
    const mesCorto = (f) => f.toLocaleDateString("es-MX", { month: "short" });
    contenido(
      n("div", { class: "g-tiles" }, tiles.map(([t, v, s]) => n("div", { class: "g-tile" }, n("span", { class: "g-tile-titulo", text: t }), n("strong", { text: String(v) }), n("small", { text: s })))),
      n("div", { class: "g-graficas" },
        barras("Asistentes en los últimos eventos", d.asistenciaReciente.map((e) => ({ etiqueta: `${e.titulo} (${G.fechaLarga(e.fecha)})`, corta: new Date(e.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" }), valor: e.presentes }))),
        d.finanzas && barras("Ingresos por mes (MXN)", d.finanzas.meses.map((m) => ({ etiqueta: m.fecha.toLocaleDateString("es-MX", { month: "long", year: "numeric" }), corta: mesCorto(m.fecha), valor: m.total })), G.dinero)),
      n("div", { class: "g-dos" },
        n("section", { class: "g-tarjeta" }, n("h3", { text: "Próximos eventos" }),
          d.proximos.length ? n("ul", { class: "g-lista" }, d.proximos.map((e) => n("li", null, n("strong", { text: e.title }), n("span", { text: G.fechaHora(e.starts_at) + (e.venue ? ` · ${e.venue}` : "") }))))
            : vacio("No hay eventos programados.")),
        n("section", { class: "g-tarjeta" }, n("h3", { text: "Avisos importantes" }),
          d.anuncios.length ? n("ul", { class: "g-lista" }, d.anuncios.map((a) => n("li", null,
            n("strong", null, a.is_important && etiqueta("Importante", "alerta"), " ", a.title), n("span", { text: a.body }))))
            : vacio("No hay anuncios vigentes."))));
  }

  /* ---------- RF-02 · Miembros ---------- */
  function pintarMiembros({ editable, busqueda, estadoFiltro }) {
    contenido(
      encabezado("Miembros", "Registro de los miembros de la iglesia. Los registros no se borran: se desactivan.", editable && boton("+ Nuevo miembro", "nuevo-miembro", null, "g-btn g-btn-principal")),
      n("div", { class: "g-filtros" },
        n("label", { class: "g-campo" }, n("span", { text: "Buscar por nombre" }), n("input", { type: "search", value: busqueda, dataset: { filtro: "busqueda" }, placeholder: "Escribe un nombre…", autocomplete: "off" })),
        selector("Mostrar", "estado", [["activos", "Activos"], ["inactivos", "Inactivos"], ["todos", "Todos"]], estadoFiltro, { cambio: "estado-miembros" })),
      n("div", { id: "g-tabla-miembros" }));
  }
  function pintarTablaMiembros(lista, editable) {
    const caja = $("g-tabla-miembros");
    if (!caja) return;
    caja.replaceChildren(
      n("p", { class: "g-conteo", text: `${lista.length} ${lista.length === 1 ? "miembro" : "miembros"}` }),
      lista.length ? tabla(["Nombre", "Teléfono", "Correo", "Fecha de ingreso", "Estado", ""], lista.map((m) => [
        m.full_name, m.phone || "—", m.email || "—", G.fechaLarga(m.joined_on),
        etiqueta(m.is_active ? "Activo" : "Inactivo", m.is_active ? "ok" : "apagado"),
        editable ? n("div", { class: "g-acciones" }, boton("Editar", "editar-miembro", m.id, "g-btn g-btn-chico"),
          m.is_active ? boton("Desactivar", "desactivar-miembro", m.id, "g-btn g-btn-chico g-btn-peligro") : boton("Reactivar", "activar-miembro", m.id, "g-btn g-btn-chico")) : ""
      ])) : vacio("No hay miembros que coincidan."));
  }
  function formMiembro(m = {}) {
    return n("form", { class: "g-form", dataset: { form: "miembro" }, novalidate: true },
      n("input", { type: "hidden", name: "id", value: m.id || "" }),
      campo("Nombre completo *", { name: "full_name", value: m.full_name || "", required: true, maxlength: "120", autocomplete: "off" }, { ancho: true }),
      campo("Teléfono", { name: "phone", type: "tel", value: m.phone || "", maxlength: "30" }),
      campo("Correo", { name: "email", type: "email", value: m.email || "", maxlength: "120" }),
      campo("Fecha de ingreso *", { name: "joined_on", type: "date", value: m.joined_on || G.hoyISO(), required: true }),
      m.id ? casilla("Miembro activo", "is_active", m.is_active) : n("input", { type: "hidden", name: "is_active", value: "on" }),
      campo("Notas", { tipo: "textarea", name: "notes", value: m.notes || "", maxlength: "500" }, { ancho: true }),
      acciones(enviar(m.id ? "Guardar cambios" : "Registrar miembro")));
  }

  /* ---------- RF-04 · Eventos y calendario ---------- */
  function pintarEventos({ eventos, editable, modo, mes, miembros, ministerios }) {
    const nombre = new Map(miembros.map((m) => [m.id, m.full_name]));
    const ministerio = new Map(ministerios.map((m) => [m.id, m.name]));
    const textoMes = mes.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    const titulo = textoMes.charAt(0).toUpperCase() + textoMes.slice(1);
    const estadoEtq = (s) => etiqueta(G.nombreDe(G.ESTADOS_EVENTO, s), s === "cancelado" ? "apagado" : s === "realizado" ? "ok" : "");
    const navegacion = n("div", { class: "g-mes" },
      boton("‹", "mes-anterior", null, "g-btn g-btn-chico"), n("strong", { text: titulo }), boton("›", "mes-siguiente", null, "g-btn g-btn-chico"),
      boton("Hoy", "mes-hoy", null, "g-btn g-btn-chico"),
      n("div", { class: "g-segmento", role: "group", "aria-label": "Tipo de vista" },
        n("button", { type: "button", class: "g-btn g-btn-chico" + (modo === "calendario" ? " activo" : ""), dataset: { accion: "vista-eventos", id: "calendario" }, "aria-pressed": String(modo === "calendario"), text: "Calendario" }),
        n("button", { type: "button", class: "g-btn g-btn-chico" + (modo === "lista" ? " activo" : ""), dataset: { accion: "vista-eventos", id: "lista" }, "aria-pressed": String(modo === "lista"), text: "Lista" })));

    let cuerpo;
    if (modo === "calendario") {
      const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
      const inicio = G.inicioSemana(primero);
      const hoy = G.hoyISO();
      const dias = [];
      const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
      const celdas = Math.ceil((Math.round((primero - inicio) / 86400000) + diasDelMes) / 7) * 7; // semanas completas
      for (let i = 0; i < celdas; i++) {
        const d = new Date(inicio); d.setDate(inicio.getDate() + i);
        const iso = G.fechaISO(d);
        const delDia = eventos.filter((e) => G.fechaISO(new Date(e.starts_at)) === iso);
        dias.push(n("div", { class: "g-dia" + (d.getMonth() !== mes.getMonth() ? " fuera" : "") + (iso === hoy ? " hoy" : "") },
          editable ? n("button", { type: "button", class: "g-dia-num", dataset: { accion: "nuevo-evento", id: iso }, "aria-label": `Nuevo evento el ${G.fechaLarga(iso)}`, text: String(d.getDate()) })
            : n("span", { class: "g-dia-num", text: String(d.getDate()) }),
          delDia.map((e) => n("button", { type: "button", class: "g-chip" + (e.status === "cancelado" ? " cancelado" : ""), dataset: { accion: "ver-evento", id: e.id }, title: e.title },
            n("span", { text: G.horaHM(new Date(e.starts_at)) }), " ", e.title))));
      }
      cuerpo = n("div", { class: "g-calendario-caja" }, n("div", { class: "g-calendario" },
        ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => n("div", { class: "g-dia-nombre", text: d })), dias));
    } else {
      cuerpo = eventos.length ? tabla(["Fecha y hora", "Evento", "Tipo", "Lugar", "Responsables", "Estado", ""], eventos.map((e) => [
        G.fechaHora(e.starts_at), n("strong", { text: e.title }),
        G.nombreDe(G.CATEGORIAS_EVENTO, e.category) + (e.ministry_id && ministerio.get(e.ministry_id) ? ` · ${ministerio.get(e.ministry_id)}` : ""),
        e.venue || "—", (e.event_responsibles || []).map((r) => nombre.get(r.member_id)).filter(Boolean).join(", ") || "—",
        estadoEtq(e.status),
        n("div", { class: "g-acciones" }, boton(editable ? "Editar" : "Ver", "ver-evento", e.id, "g-btn g-btn-chico"),
          editable && e.status !== "cancelado" && boton("Cancelar", "cancelar-evento", e.id, "g-btn g-btn-chico g-btn-peligro"))
      ])) : vacio("No hay eventos en este mes.");
    }
    contenido(encabezado("Eventos", "Cultos, reuniones y actividades religiosas o administrativas.", editable && boton("+ Nuevo evento", "nuevo-evento", null, "g-btn g-btn-principal")), navegacion, cuerpo);
  }
  function formEvento(e = {}, { miembros, ministerios, editable, fecha }) {
    const inicio = e.starts_at ? new Date(e.starts_at) : null;
    const fin = e.ends_at ? new Date(e.ends_at) : null;
    const form = n("form", { class: "g-form", dataset: { form: "evento" }, novalidate: true },
      n("input", { type: "hidden", name: "id", value: e.id || "" }),
      campo("Título *", { name: "title", value: e.title || "", required: true, maxlength: "150" }, { ancho: true }),
      selector("Tipo de evento", "category", G.CATEGORIAS_EVENTO, e.category || "culto"),
      selector("Estado", "status", G.ESTADOS_EVENTO, e.status || "programado"),
      campo("Fecha *", { name: "fecha", type: "date", value: inicio ? G.fechaISO(inicio) : (fecha || G.hoyISO()), required: true }),
      campo("Hora de inicio *", { name: "hora", type: "time", value: inicio ? G.horaHM(inicio) : "18:00", required: true }),
      campo("Hora de término", { name: "hora_fin", type: "time", value: fin ? G.horaHM(fin) : "" }),
      campo("Lugar", { name: "venue", value: e.venue || "", maxlength: "150" }),
      selector("Ministerio (opcional)", "ministry_id", ministerios.map((m) => [m.id, m.name]), e.ministry_id, { vacioTexto: "Ninguno", ancho: true }),
      campo("Descripción", { tipo: "textarea", name: "description", value: e.description || "", maxlength: "1000" }, { ancho: true }),
      listaMiembros("Responsables", "responsables", miembros.filter((m) => m.is_active), (e.event_responsibles || []).map((r) => r.member_id)),
      editable ? acciones(enviar(e.id ? "Guardar cambios" : "Crear evento")) : null);
    if (!editable) form.querySelectorAll("input, select, textarea").forEach((c) => { c.disabled = true; });
    return form;
  }

  /* ---------- RF-03 · Asistencia ---------- */
  function pintarAsistencia({ eventos, eventoId, miembros, marcas, editable, historial }) {
    const evento = eventos.find((e) => e.id === eventoId);
    const marca = new Map((marcas || []).map((m) => [m.member_id, m.present]));
    const opciones = eventos.slice().reverse().map((e) => [e.id, `${G.fechaLarga(e.starts_at)} · ${e.title}${e.status === "cancelado" ? " (cancelado)" : ""}`]);
    const lista = evento ? n("form", { class: "g-form g-asistencia", dataset: { form: "asistencia" }, novalidate: true },
      n("div", { class: "g-encabezado-botones ancho" },
        n("p", { class: "g-conteo", id: "g-conteo-asistencia" }),
        editable && boton("Todos presentes", "marcar-todos", "1", "g-btn g-btn-chico"),
        editable && boton("Todos ausentes", "marcar-todos", "0", "g-btn g-btn-chico")),
      miembros.length ? n("ul", { class: "g-pase ancho" }, miembros.map((m) => {
        const presente = marca.get(m.id);
        return n("li", null, n("span", { text: m.full_name }),
          n("div", { class: "g-segmento", role: "radiogroup", "aria-label": `Asistencia de ${m.full_name}` },
            n("label", { class: "g-opcion presente" }, n("input", { type: "radio", name: `m-${m.id}`, value: "1", checked: presente === true, disabled: !editable }), n("span", { text: "Presente" })),
            n("label", { class: "g-opcion ausente" }, n("input", { type: "radio", name: `m-${m.id}`, value: "0", checked: presente === false, disabled: !editable }), n("span", { text: "Ausente" }))));
      })) : vacio("No hay miembros activos para pasar lista."),
      editable && miembros.length ? acciones(enviar("Guardar asistencia")) : null) : vacio("Elige un evento para pasar lista.");

    contenido(
      encabezado("Control de asistencia", "Elige la fecha y el evento, y marca a cada miembro como presente o ausente."),
      n("div", { class: "g-filtros" }, selector("Evento", "evento", opciones, eventoId, { vacioTexto: eventos.length ? "Elige un evento…" : "No hay eventos registrados", cambio: "evento-asistencia", ancho: true })),
      evento && n("p", { class: "g-detalle-evento", text: `${G.fechaHora(evento.starts_at)}${evento.venue ? " · " + evento.venue : ""} · ${G.nombreDe(G.CATEGORIAS_EVENTO, evento.category)}` }),
      lista,
      n("section", { class: "g-tarjeta g-historial" }, n("h3", { text: "Historial de asistencia" }),
        historial.length ? tabla(["Fecha", "Evento", "Presentes", "Ausentes", ""], historial.map((h) => [
          G.fechaHora(h.starts_at), h.title, String(h.presentes), String(h.ausentes), boton("Ver", "ver-asistencia", h.id, "g-btn g-btn-chico")
        ])) : vacio("Todavía no hay asistencias registradas.")));
    actualizarConteoAsistencia();
  }
  function actualizarConteoAsistencia() {
    const form = document.querySelector('[data-form="asistencia"]');
    const p = $("g-conteo-asistencia");
    if (!form || !p) return;
    const total = form.querySelectorAll(".g-pase li").length;
    const presentes = form.querySelectorAll('input[value="1"]:checked').length;
    const ausentes = form.querySelectorAll('input[value="0"]:checked').length;
    p.textContent = `${presentes} presentes · ${ausentes} ausentes · ${total - presentes - ausentes} sin marcar`;
  }

  /* ---------- RF-05 · Ministerios ---------- */
  function pintarMinisterios({ ministerios, miembros, eventos, editable }) {
    const nombre = new Map(miembros.map((m) => [m.id, m.full_name]));
    contenido(
      encabezado("Ministerios", "Grupos de trabajo como música, jóvenes, niños, enseñanza y servicio.", editable && boton("+ Nuevo ministerio", "nuevo-ministerio", null, "g-btn g-btn-principal")),
      ministerios.length ? n("div", { class: "g-rejilla" }, ministerios.map((m) => {
        const integrantes = (m.ministry_members || []).map((x) => nombre.get(x.member_id)).filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
        const proximos = eventos.filter((e) => e.ministry_id === m.id && e.status === "programado");
        return n("article", { class: "g-tarjeta g-ministerio" },
          n("h3", { text: m.name }),
          m.description && n("p", { text: m.description }),
          n("p", { class: "g-dato" }, n("span", { text: "Coordinador: " }), n("strong", { text: nombre.get(m.coordinator_member_id) || "Sin asignar" })),
          n("p", { class: "g-dato" }, n("span", { text: `Integrantes (${integrantes.length}): ` }), integrantes.join(", ") || "—"),
          n("div", { class: "g-dato" }, n("span", { text: "Actividades programadas:" }),
            proximos.length ? n("ul", { class: "g-lista compacta" }, proximos.slice(0, 4).map((e) => n("li", null, n("strong", { text: e.title }), n("span", { text: G.fechaHora(e.starts_at) }))))
              : n("span", { text: " ninguna" })),
          editable && n("div", { class: "g-acciones" }, boton("Editar", "editar-ministerio", m.id, "g-btn g-btn-chico"), boton("Eliminar", "eliminar-ministerio", m.id, "g-btn g-btn-chico g-btn-peligro")));
      })) : vacio("Todavía no hay ministerios registrados."));
  }
  function formMinisterio(m = {}, miembros) {
    const activos = miembros.filter((x) => x.is_active);
    return n("form", { class: "g-form", dataset: { form: "ministerio" }, novalidate: true },
      n("input", { type: "hidden", name: "id", value: m.id || "" }),
      campo("Nombre del ministerio *", { name: "name", value: m.name || "", required: true, maxlength: "100", list: "g-sugerencias-ministerios" }, { ancho: true }),
      n("datalist", { id: "g-sugerencias-ministerios" }, ["Música", "Jóvenes", "Niños", "Enseñanza", "Servicio"].map((s) => n("option", { value: s }))),
      selector("Coordinador", "coordinator_member_id", activos.map((x) => [x.id, x.full_name]), m.coordinator_member_id, { vacioTexto: "Sin asignar", ancho: true }),
      campo("Descripción", { tipo: "textarea", name: "description", value: m.description || "", maxlength: "500" }, { ancho: true }),
      listaMiembros("Integrantes", "integrantes", activos, (m.ministry_members || []).map((x) => x.member_id)),
      acciones(enviar(m.id ? "Guardar cambios" : "Crear ministerio")));
  }

  /* ---------- RF-06 · Donaciones ---------- */
  function pintarDonaciones({ donaciones, resumen, desde, hasta, editable, porMes }) {
    contenido(
      encabezado("Donaciones y aportaciones", "Información financiera visible solo para administrador, pastor y tesorero.", editable && boton("+ Registrar aportación", "nueva-donacion", null, "g-btn g-btn-principal")),
      n("form", { class: "g-filtros", dataset: { form: "filtro-donaciones" }, novalidate: true },
        campo("Desde", { name: "desde", type: "date", value: desde || "" }),
        campo("Hasta", { name: "hasta", type: "date", value: hasta || "" }),
        n("div", { class: "g-filtros-botones" }, enviar("Consultar"),
          boton("Este mes", "periodo-donaciones", "mes"), boton("Mes pasado", "periodo-donaciones", "mes-pasado"), boton("Este año", "periodo-donaciones", "anio"), boton("Todo", "periodo-donaciones", "todo"))),
      n("div", { class: "g-tiles" },
        [["Total del periodo", G.dinero(resumen.total)], ["Aportaciones", String(resumen.cantidad)], ["Anónimas", String(resumen.anonimas)]]
          .map(([t, v]) => n("div", { class: "g-tile" }, n("span", { class: "g-tile-titulo", text: t }), n("strong", { text: v })))),
      n("div", { class: "g-dos" },
        n("section", { class: "g-tarjeta" }, n("h3", { text: "Resumen mensual" }),
          porMes.length ? tabla(["Mes", "Total"], porMes.map(([mes, total]) => [new Date(mes + "-15T12:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" }), G.dinero(total)])) : vacio("Sin aportaciones en el periodo.")),
        n("section", { class: "g-tarjeta" }, n("h3", { text: "Por concepto" }),
          resumen.porConcepto.length ? tabla(["Concepto", "Total"], resumen.porConcepto.map(([c, t]) => [c, G.dinero(t)])) : vacio("Sin datos."))),
      donaciones.length ? tabla(["Fecha", "Concepto", "Método", "Donante", "Monto", ""], donaciones.map((d) => [
        G.fechaLarga(d.donated_on), d.concept, G.nombreDe(G.METODOS_PAGO, d.payment_method) || "—",
        d.is_anonymous ? etiqueta("Anónimo", "apagado") : (d.members?.full_name || "Sin asociar"),
        n("strong", { text: G.dinero(d.amount) }),
        editable ? n("div", { class: "g-acciones" }, boton("Editar", "editar-donacion", d.id, "g-btn g-btn-chico"), boton("Eliminar", "eliminar-donacion", d.id, "g-btn g-btn-chico g-btn-peligro")) : ""
      ])) : vacio("No hay aportaciones en este periodo."));
  }
  function formDonacion(d = {}, miembros) {
    return n("form", { class: "g-form", dataset: { form: "donacion" }, novalidate: true },
      n("input", { type: "hidden", name: "id", value: d.id || "" }),
      campo("Fecha *", { name: "donated_on", type: "date", value: d.donated_on || G.hoyISO(), required: true }),
      campo("Monto (MXN) *", { name: "amount", type: "number", min: "0.01", step: "0.01", inputmode: "decimal", value: d.amount ?? "", required: true }),
      campo("Concepto *", { name: "concept", value: d.concept || "", required: true, maxlength: "120", list: "g-sugerencias-concepto" }),
      n("datalist", { id: "g-sugerencias-concepto" }, ["Diezmo", "Ofrenda", "Donativo", "Primicias", "Misiones", "Construcción"].map((s) => n("option", { value: s }))),
      selector("Método de recepción", "payment_method", G.METODOS_PAGO, d.payment_method || "efectivo"),
      casilla("Aportación anónima (no se asocia a ninguna persona)", "is_anonymous", d.is_anonymous),
      selector("Donante (opcional)", "donor_member_id", miembros.map((m) => [m.id, m.full_name]), d.donor_member_id, { vacioTexto: "Sin asociar", ancho: true }),
      campo("Notas", { tipo: "textarea", name: "notes", value: d.notes || "", maxlength: "500" }, { ancho: true }),
      acciones(enviar(d.id ? "Guardar cambios" : "Registrar aportación")));
  }

  /* ---------- RF-07 · Anuncios ---------- */
  function pintarAnuncios({ anuncios, editable }) {
    contenido(
      encabezado("Comunicados y anuncios", "Avisos para los miembros, con su fecha de publicación.", editable && boton("+ Nuevo anuncio", "nuevo-anuncio", null, "g-btn g-btn-principal")),
      anuncios.length ? n("div", { class: "g-rejilla" }, anuncios.map((a) => n("article", { class: "g-tarjeta g-anuncio" + (a.is_important ? " importante" : "") },
        n("div", { class: "g-etiquetas" },
          a.is_important && etiqueta("Importante", "alerta"),
          etiqueta(G.anuncioVigente(a) ? "Vigente" : (a.published_on > G.hoyISO() ? "Programado" : "Vencido"), G.anuncioVigente(a) ? "ok" : "apagado"),
          etiqueta(a.is_public ? "Público" : "Solo personal")),
        n("h3", { text: a.title }),
        n("p", { class: "g-fecha", text: `Publicado el ${G.fechaLarga(a.published_on)}${a.expires_on ? ` · hasta el ${G.fechaLarga(a.expires_on)}` : ""}` }),
        n("p", { class: "g-cuerpo", text: a.body }),
        editable && n("div", { class: "g-acciones" }, boton("Editar", "editar-anuncio", a.id, "g-btn g-btn-chico"), boton("Eliminar", "eliminar-anuncio", a.id, "g-btn g-btn-chico g-btn-peligro")))))
        : vacio("Todavía no hay anuncios publicados."));
  }
  function formAnuncio(a = {}) {
    return n("form", { class: "g-form", dataset: { form: "anuncio" }, novalidate: true },
      n("input", { type: "hidden", name: "id", value: a.id || "" }),
      campo("Título *", { name: "title", value: a.title || "", required: true, maxlength: "150" }, { ancho: true }),
      campo("Fecha de publicación *", { name: "published_on", type: "date", value: a.published_on || G.hoyISO(), required: true }),
      campo("Visible hasta (opcional)", { name: "expires_on", type: "date", value: a.expires_on || "" }),
      campo("Texto del anuncio *", { tipo: "textarea", name: "body", value: a.body || "", required: true, maxlength: "2000" }, { ancho: true }),
      casilla("Aviso importante", "is_important", a.is_important),
      casilla("Público (lo pueden ver los visitantes)", "is_public", a.id ? a.is_public : true),
      acciones(enviar(a.id ? "Guardar cambios" : "Publicar")));
  }

  /* ---------- RF-09 · Reportes ---------- */
  function pintarReportes({ tipos, tipo, opciones, eventos, reporte }) {
    const necesitaFechas = ["asistencia-semanal", "asistencia-mensual", "ingresos"].includes(tipo);
    contenido(
      encabezado("Reportes", "Genera un reporte y descárgalo en PDF o Excel."),
      n("form", { class: "g-filtros", dataset: { form: "reporte" }, novalidate: true },
        selector("Reporte", "tipo", tipos, tipo, { cambio: "tipo-reporte", ancho: true }),
        tipo === "miembros" && selector("Miembros", "estadoMiembro", [["todos", "Todos"], ["activos", "Activos"], ["inactivos", "Inactivos"]], opciones.estadoMiembro),
        tipo === "asistencia-evento" && selector("Evento", "eventoId", eventos.slice().reverse().map((e) => [e.id, `${G.fechaLarga(e.starts_at)} · ${e.title}`]), opciones.eventoId, { vacioTexto: "Elige un evento…", ancho: true }),
        necesitaFechas && campo("Desde", { name: "desde", type: "date", value: opciones.desde || "" }),
        necesitaFechas && campo("Hasta", { name: "hasta", type: "date", value: opciones.hasta || "" }),
        n("div", { class: "g-filtros-botones" }, enviar("Generar reporte"))),
      reporte ? n("section", { class: "g-tarjeta g-reporte" },
        n("div", { class: "g-encabezado" },
          n("div", null, n("h3", { text: reporte.titulo }), n("p", { text: reporte.subtitulo || "" })),
          n("div", { class: "g-encabezado-botones" }, boton("Descargar PDF", "exportar-pdf"), boton("Descargar Excel", "exportar-excel"))),
        reporte.resumen?.length && n("div", { class: "g-etiquetas" }, reporte.resumen.map(([t, v]) => etiqueta(`${t}: ${v}`))),
        reporte.filas.length ? tabla(reporte.columnas, reporte.filas) : vacio("No hay datos para este reporte."),
        reporte.extra?.filas.length && n("h4", { text: reporte.extra.titulo }),
        reporte.extra?.filas.length && tabla(reporte.extra.columnas, reporte.extra.filas))
        : vacio("Elige el tipo de reporte y presiona “Generar reporte”."));
  }

  /* ---------- RF-10 · Configuración de la iglesia ---------- */
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((d) => [d, d]);
  function filaReunion(r = {}, editable = true) {
    return n("div", { class: "g-reunion" },
      selector("Día", "r_dia", DIAS, r.dia || "Domingo"),
      campo("Hora", { name: "r_hora", type: "time", value: r.hora || "10:00" }),
      campo("Reunión", { name: "r_actividad", value: r.actividad || "", maxlength: "100", placeholder: "Culto dominical, estudio bíblico…" }),
      editable && boton("Quitar", "quitar-reunion", null, "g-btn g-btn-chico g-btn-peligro"));
  }
  function pintarConfiguracion(ig, editable, reuniones) {
    const form = n("form", { class: "g-form g-config", dataset: { form: "iglesia" }, novalidate: true },
      n("div", { class: "g-logo ancho" },
        n("img", { id: "g-logo-img", alt: "Logotipo de la iglesia", src: ig.logo_path || null, hidden: !ig.logo_path }),
        n("span", { id: "g-logo-vacio", class: "g-logo-vacio", hidden: !!ig.logo_path, text: "Sin logotipo" }),
        n("input", { type: "hidden", name: "logo_path", id: "g-logo-dato", value: ig.logo_path || "" }),
        editable && n("div", { class: "g-acciones" },
          boton("Subir logotipo", "elegir-logo"), boton("Quitar logotipo", "quitar-logo", null, "g-btn g-btn-peligro"),
          n("input", { type: "file", accept: "image/*", id: "g-logo-archivo", hidden: true, "aria-label": "Elegir logotipo" }))),
      campo("Nombre de la iglesia *", { name: "name", value: ig.name || "", required: true, maxlength: "150" }, { ancho: true }),
      campo("Nombre corto", { name: "short_name", value: ig.short_name || "", maxlength: "60" }),
      campo("Teléfono", { name: "phone", type: "tel", value: ig.phone || "", maxlength: "30" }),
      campo("Dirección", { name: "address", value: ig.address || "", maxlength: "250" }, { ancho: true }),
      campo("Correo de contacto", { name: "contact_email", type: "email", value: ig.contact_email || "", maxlength: "120" }),
      campo("Sitio web", { name: "website", type: "url", value: ig.website || "", maxlength: "200", placeholder: "https://" }),
      n("fieldset", { class: "g-campo ancho g-reuniones" }, n("legend", { text: "Horarios habituales de reuniones" }),
        n("div", { id: "g-reuniones" }, reuniones.map((r) => filaReunion(r, editable))),
        editable && boton("+ Agregar horario", "agregar-reunion")),
      editable ? acciones(enviar("Guardar información")) : n("p", { class: "g-vacio ancho", text: "Solo el administrador puede cambiar estos datos." }));
    if (!editable) form.querySelectorAll("input, select, textarea").forEach((c) => { c.disabled = true; });
    contenido(encabezado("Configuración de la iglesia", "Datos institucionales, logotipo, contacto y horarios."), n("section", { class: "g-tarjeta" }, form));
  }
  const agregarFilaReunion = () => $("g-reuniones")?.append(filaReunion({}));
  function pintarLogo(dato) {
    $("g-logo-dato").value = dato || "";
    $("g-logo-img").hidden = !dato;
    if (dato) $("g-logo-img").src = dato; else $("g-logo-img").removeAttribute("src");
    $("g-logo-vacio").hidden = !!dato;
  }

  /* ---------- RF-01 · Usuarios del sistema ---------- */
  function pintarUsuarios({ usuarios, iglesias, yo }) {
    const nombreIglesia = new Map(iglesias.map((i) => [i.id, i.name]));
    contenido(
      encabezado("Usuarios y roles", "Cuentas que pueden entrar a la gestión y lo que puede hacer cada rol.", boton("+ Registrar usuario", "nuevo-usuario", null, "g-btn g-btn-principal")),
      usuarios.length ? tabla(["Nombre", "Rol", "Iglesia", "Estado", "Alta", ""], usuarios.map((u) => [
        n("strong", { text: u.full_name + (u.user_id === yo ? " (tú)" : "") }), G.nombreRol(u.app_role),
        nombreIglesia.get(u.church_id) || (u.app_role === "administrador" ? "Todas" : "—"),
        etiqueta(u.is_active ? "Activo" : "Inactivo", u.is_active ? "ok" : "apagado"), G.fechaLarga(u.created_at),
        boton("Editar", "editar-usuario", u.user_id, "g-btn g-btn-chico")
      ])) : vacio("No hay usuarios con rol."),
      n("section", { class: "g-tarjeta" }, n("h3", { text: "Qué puede hacer cada rol" }),
        tabla(["Rol", "Permisos"], [
          ["Administrador", "Todo: usuarios, configuración, finanzas y todos los módulos de todas las iglesias."],
          ["Pastor", "Miembros, eventos, asistencia, ministerios, donaciones, anuncios y reportes."],
          ["Secretario", "Miembros, eventos, asistencia, anuncios y reportes (sin finanzas)."],
          ["Tesorero", "Donaciones y reporte de ingresos; consulta lo demás."],
          ["Coordinador", "Eventos, asistencia, ministerios y anuncios; consulta lo demás."]
        ])));
  }
  function formUsuario(u, iglesias, nuevo) {
    return n("form", { class: "g-form", dataset: { form: nuevo ? "usuario-nuevo" : "usuario" }, novalidate: true },
      n("input", { type: "hidden", name: "user_id", value: u.user_id || "" }),
      campo("Nombre completo *", { name: "full_name", value: u.full_name || "", required: true, maxlength: "120" }, { ancho: true }),
      nuevo && campo("Correo *", { name: "email", type: "email", required: true, autocomplete: "off" }),
      nuevo && campo("Contraseña temporal *", { name: "password", type: "password", required: true, minlength: "6", autocomplete: "new-password" }, { ayuda: "Mínimo 6 caracteres. El usuario puede cambiarla con “¿Olvidaste tu contraseña?”." }),
      selector("Rol *", "app_role", G.ROLES.map((r) => [r, G.nombreRol(r)]), u.app_role || "secretario"),
      selector("Iglesia", "church_id", iglesias.map((i) => [i.id, i.name]), u.church_id, { vacioTexto: "Todas (solo administrador)" }),
      !nuevo && casilla("Usuario activo", "is_active", u.is_active),
      acciones(enviar(nuevo ? "Registrar usuario" : "Guardar cambios")));
  }

  return {
    pintarMarco, pintarSinRol, pintarCargando, aviso, abrirDialogo, cerrarDialogo, mensajeFormulario, bloquearFormulario,
    pintarPanel, pintarMiembros, pintarTablaMiembros, formMiembro,
    pintarEventos, formEvento, pintarAsistencia, actualizarConteoAsistencia,
    pintarMinisterios, formMinisterio, pintarDonaciones, formDonacion,
    pintarAnuncios, formAnuncio, pintarReportes,
    pintarConfiguracion, agregarFilaReunion, pintarLogo,
    pintarUsuarios, formUsuario
  };
})();
