/* =========================================================
   MODELO · REPORTES (RF-03 y RF-09)
   Convierte los datos de Supabase en tablas simples
   { titulo, subtitulo, columnas, filas, resumen } que la vista
   muestra y que se exportan a PDF o Excel. NO toca el DOM.
   ========================================================= */
const GestionReportes = (() => {
  const G = GestionModelo;

  const TIPOS = [
    ["miembros", "Reporte general de miembros"],
    ["asistencia-evento", "Asistencia por evento"],
    ["asistencia-semanal", "Asistencia semanal"],
    ["asistencia-mensual", "Asistencia mensual"],
    ["ministerios", "Participación por ministerio"],
    ["ingresos", "Ingresos por periodo"]
  ];
  const esFinanciero = (tipo) => tipo === "ingresos";
  const porcentaje = (a, total) => (total ? `${Math.round((a / total) * 100)} %` : "—");

  /** 1. Reporte general de miembros. */
  async function miembros({ estadoMiembro = "todos" } = {}) {
    const [lista, ministerios] = await Promise.all([G.listarMiembros(), G.listarMinisterios()]);
    const ministeriosDe = (id) => ministerios.filter((m) => (m.ministry_members || []).some((x) => x.member_id === id)).map((m) => m.name);
    const filtrados = lista.filter((m) => estadoMiembro === "todos" || (estadoMiembro === "activos" ? m.is_active : !m.is_active));
    return {
      titulo: "Reporte general de miembros",
      subtitulo: { todos: "Todos los miembros", activos: "Solo miembros activos", inactivos: "Solo miembros inactivos" }[estadoMiembro],
      columnas: ["Nombre", "Teléfono", "Correo", "Fecha de ingreso", "Estado", "Ministerios"],
      filas: filtrados.map((m) => [m.full_name, m.phone || "", m.email || "", G.fechaLarga(m.joined_on), m.is_active ? "Activo" : "Inactivo", ministeriosDe(m.id).join(", ")]),
      resumen: [["Total", filtrados.length], ["Activos", filtrados.filter((m) => m.is_active).length], ["Inactivos", filtrados.filter((m) => !m.is_active).length]]
    };
  }

  /** 2. Asistencia de un evento: quién vino y quién no. */
  async function asistenciaEvento({ eventoId, eventos }) {
    const evento = eventos.find((e) => e.id === eventoId);
    if (!evento) return { titulo: "Asistencia por evento", subtitulo: "Elige un evento", columnas: ["Miembro", "Asistencia"], filas: [], resumen: [] };
    const [marcas, lista] = await Promise.all([G.asistenciaDeEvento(eventoId), G.listarMiembros()]);
    const nombre = new Map(lista.map((m) => [m.id, m.full_name]));
    const filas = marcas.map((a) => [nombre.get(a.member_id) || "(miembro)", a.present ? "Presente" : "Ausente"])
      .sort((a, b) => a[0].localeCompare(b[0], "es"));
    const presentes = marcas.filter((a) => a.present).length;
    return {
      titulo: `Asistencia: ${evento.title}`,
      subtitulo: G.fechaHora(evento.starts_at) + (evento.venue ? ` · ${evento.venue}` : ""),
      columnas: ["Miembro", "Asistencia"], filas,
      resumen: [["Presentes", presentes], ["Ausentes", marcas.length - presentes], ["Asistencia", porcentaje(presentes, marcas.length)]]
    };
  }

  /** 3. Asistencia agrupada por semana o por mes en un periodo. */
  async function asistenciaPeriodo({ agrupar, desde, hasta }) {
    const registros = await G.asistenciaPeriodo({ desde: desde && new Date(desde + "T00:00").toISOString(), hasta: hasta && new Date(hasta + "T23:59:59").toISOString() });
    const grupos = new Map();
    registros.forEach((r) => {
      const d = new Date(r.events.starts_at);
      const clave = agrupar === "semana" ? G.fechaISO(G.inicioSemana(d)) : G.fechaISO(d).slice(0, 7);
      const g = grupos.get(clave) || { eventos: new Set(), presentes: 0, ausentes: 0 };
      g.eventos.add(r.event_id);
      if (r.present) g.presentes++; else g.ausentes++;
      grupos.set(clave, g);
    });
    const etiqueta = (clave) => {
      if (agrupar === "semana") {
        const ini = new Date(clave + "T12:00");
        const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
        return `Semana del ${G.fechaLarga(G.fechaISO(ini))} al ${G.fechaLarga(G.fechaISO(fin))}`;
      }
      return new Date(clave + "-15T12:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    };
    const claves = [...grupos.keys()].sort();
    const filas = claves.map((k) => {
      const g = grupos.get(k);
      return [etiqueta(k), g.eventos.size, g.presentes, g.ausentes, porcentaje(g.presentes, g.presentes + g.ausentes)];
    });
    const totalP = claves.reduce((s, k) => s + grupos.get(k).presentes, 0);
    const totalA = claves.reduce((s, k) => s + grupos.get(k).ausentes, 0);
    return {
      titulo: agrupar === "semana" ? "Reporte semanal de asistencia" : "Reporte mensual de asistencia",
      subtitulo: rangoTexto(desde, hasta),
      columnas: [agrupar === "semana" ? "Semana" : "Mes", "Eventos", "Presentes", "Ausentes", "Asistencia"],
      filas,
      resumen: [["Presentes", totalP], ["Ausentes", totalA], ["Asistencia promedio", porcentaje(totalP, totalP + totalA)]]
    };
  }

  /** 4. Participación por ministerio. */
  async function ministerios() {
    const [lista, miembrosLista, eventos] = await Promise.all([G.listarMinisterios(), G.listarMiembros(), G.listarEventos({ desde: new Date().toISOString() })]);
    const nombre = new Map(miembrosLista.map((m) => [m.id, m.full_name]));
    const filas = lista.map((m) => {
      const integrantes = (m.ministry_members || []).map((x) => nombre.get(x.member_id)).filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
      const programados = eventos.filter((e) => e.ministry_id === m.id && e.status === "programado").length;
      return [m.name, nombre.get(m.coordinator_member_id) || "Sin asignar", integrantes.length, integrantes.join(", "), programados];
    });
    return {
      titulo: "Participación por ministerio",
      subtitulo: "Integrantes y actividades programadas",
      columnas: ["Ministerio", "Coordinador", "Integrantes", "Nombres", "Actividades próximas"],
      filas,
      resumen: [["Ministerios", lista.length], ["Participaciones", filas.reduce((s, f) => s + f[2], 0)]]
    };
  }

  /** 5. Ingresos por periodo (solo personal autorizado). */
  async function ingresos({ desde, hasta }) {
    if (!G.veFinanzas()) throw Object.assign(new Error("Sin permiso"), { code: "42501" });
    const donaciones = await G.listarDonaciones({ desde, hasta });
    const r = G.resumenDonaciones(donaciones);
    const meses = [...G.totalesPorMes(donaciones).entries()].sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, total]) => [new Date(mes + "-15T12:00").toLocaleDateString("es-MX", { month: "long", year: "numeric" }), G.dinero(total)]);
    return {
      titulo: "Ingresos por periodo",
      subtitulo: rangoTexto(desde, hasta),
      columnas: ["Fecha", "Concepto", "Método", "Donante", "Monto"],
      filas: donaciones.map((d) => [G.fechaLarga(d.donated_on), d.concept, G.nombreDe(G.METODOS_PAGO, d.payment_method), d.is_anonymous ? "Anónimo" : (d.members?.full_name || "Sin asociar"), G.dinero(d.amount)]),
      resumen: [["Total", G.dinero(r.total)], ["Aportaciones", r.cantidad], ["Anónimas", r.anonimas]],
      extra: { titulo: "Resumen mensual", columnas: ["Mes", "Total"], filas: meses }
    };
  }

  function rangoTexto(desde, hasta) {
    if (desde && hasta) return `Del ${G.fechaLarga(desde)} al ${G.fechaLarga(hasta)}`;
    if (desde) return `Desde el ${G.fechaLarga(desde)}`;
    if (hasta) return `Hasta el ${G.fechaLarga(hasta)}`;
    return "Todo el historial";
  }

  async function generar(tipo, opciones) {
    if (tipo === "miembros") return miembros(opciones);
    if (tipo === "asistencia-evento") return asistenciaEvento(opciones);
    if (tipo === "asistencia-semanal") return asistenciaPeriodo({ ...opciones, agrupar: "semana" });
    if (tipo === "asistencia-mensual") return asistenciaPeriodo({ ...opciones, agrupar: "mes" });
    if (tipo === "ministerios") return ministerios();
    if (tipo === "ingresos") return ingresos(opciones);
    throw new Error("Reporte desconocido");
  }

  const tiposVisibles = () => TIPOS.filter(([t]) => !esFinanciero(t) || G.veFinanzas());

  return { TIPOS, generar, tiposVisibles, esFinanciero };
})();
