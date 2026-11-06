/* =========================================================
   MODELO · GESTIÓN DE LA IGLESIA (RF-01 a RF-10)
   Habla con las tablas de Supabase del esquema "merida-sacra":
   profiles, members, events, event_responsibles, attendance,
   ministries, ministry_members, donations, announcements, churches.
   NO toca el DOM. La seguridad real la ponen las políticas RLS;
   los permisos de aquí solo deciden qué se muestra.
   ========================================================= */
const GestionModelo = (() => {
  const ROLES = ["administrador", "pastor", "secretario", "tesorero", "coordinador"];
  const TODOS = ROLES;

  // Quién puede VER y quién puede EDITAR cada módulo (igual que las políticas RLS)
  const PERMISOS = {
    dashboard:     { ver: TODOS, editar: [] },
    miembros:      { ver: TODOS, editar: ["administrador", "pastor", "secretario"] },
    eventos:       { ver: TODOS, editar: ["administrador", "pastor", "secretario", "coordinador"] },
    asistencia:    { ver: TODOS, editar: ["administrador", "pastor", "secretario", "coordinador"] },
    ministerios:   { ver: TODOS, editar: ["administrador", "pastor", "coordinador"] },
    donaciones:    { ver: ["administrador", "pastor", "tesorero"], editar: ["administrador", "pastor", "tesorero"] },
    anuncios:      { ver: TODOS, editar: ["administrador", "pastor", "secretario", "coordinador"] },
    reportes:      { ver: TODOS, editar: [] },
    configuracion: { ver: TODOS, editar: ["administrador"] },
    usuarios:      { ver: ["administrador"], editar: ["administrador"] }
  };
  const FINANZAS = PERMISOS.donaciones.ver;

  const MODULOS = [
    ["dashboard", "Panel"], ["miembros", "Miembros"], ["asistencia", "Asistencia"],
    ["eventos", "Eventos"], ["ministerios", "Ministerios"], ["donaciones", "Donaciones"],
    ["anuncios", "Anuncios"], ["reportes", "Reportes"], ["configuracion", "Configuración"],
    ["usuarios", "Usuarios"]
  ];

  // Estado de la gestión (solo lo cambia el controlador)
  const sesion = {
    perfil: null,     // { userId, nombre, rol, churchId, activo }
    iglesias: [],     // churches que puede ver
    iglesiaId: null,  // iglesia con la que se trabaja
    cargado: false
  };

  const db = () => supabaseClient;
  const revisar = ({ data, error }) => { if (error) throw error; return data; };

  /* ---------- Permisos ---------- */
  const puede = (modulo, accion = "ver") => !!sesion.perfil && PERMISOS[modulo]?.[accion].includes(sesion.perfil.rol);
  const veFinanzas = () => !!sesion.perfil && FINANZAS.includes(sesion.perfil.rol);
  const modulosVisibles = () => MODULOS.filter(([clave]) => puede(clave));

  /* ---------- Fechas (siempre hora local de la iglesia) ---------- */
  const dosDigitos = (n) => String(n).padStart(2, "0");
  const fechaISO = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
  const horaHM = (d) => `${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}`;
  const hoyISO = () => fechaISO(new Date());
  const aInstante = (fecha, hora) => (fecha ? new Date(`${fecha}T${hora || "00:00"}`).toISOString() : null);
  function inicioSemana(d = new Date()) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    r.setDate(r.getDate() - ((r.getDay() + 6) % 7)); // lunes
    return r;
  }

  /* ---------- Sesión y rol (RF-01) ---------- */
  async function cargarSesion(usuario) {
    sesion.perfil = null;
    sesion.iglesias = [];
    sesion.iglesiaId = null;
    sesion.cargado = false;
    if (!usuario?.id) return null;
    const fila = revisar(await db().from("profiles")
      .select("user_id,full_name,app_role,church_id,is_active").eq("user_id", usuario.id).maybeSingle());
    sesion.cargado = true;
    if (!fila || !fila.is_active) return null;
    sesion.perfil = { userId: fila.user_id, nombre: fila.full_name, rol: fila.app_role, churchId: fila.church_id, activo: fila.is_active };
    sesion.iglesias = revisar(await db().from("churches").select("id,name,short_name").order("name"));
    sesion.iglesiaId = fila.church_id || sesion.iglesias[0]?.id || null;
    return sesion.perfil;
  }
  function limpiarSesion() {
    sesion.perfil = null; sesion.iglesias = []; sesion.iglesiaId = null; sesion.cargado = false;
  }
  function elegirIglesia(id) {
    // Solo el administrador cambia de iglesia; los demás trabajan en la suya
    if (sesion.perfil?.rol === "administrador" && sesion.iglesias.some((i) => i.id === id)) sesion.iglesiaId = id;
  }
  const iglesia = () => sesion.iglesiaId;
  const usuarioId = () => sesion.perfil?.userId || null;

  /* ---------- Miembros (RF-02) ---------- */
  const listarMiembros = async () => revisar(await db().from("members")
    .select("id,full_name,phone,email,joined_on,is_active,notes").eq("church_id", iglesia()).order("full_name"));
  async function guardarMiembro(datos) {
    const fila = {
      church_id: iglesia(), full_name: datos.full_name, phone: datos.phone || null, email: datos.email || null,
      joined_on: datos.joined_on || hoyISO(), notes: datos.notes || null, is_active: datos.is_active !== false
    };
    if (datos.id) return revisar(await db().from("members").update(fila).eq("id", datos.id).select().single());
    return revisar(await db().from("members").insert(fila).select().single());
  }
  // Nunca se borra: solo se desactiva o se reactiva
  const cambiarActivoMiembro = async (id, activo) =>
    revisar(await db().from("members").update({ is_active: activo }).eq("id", id));

  /* ---------- Ministerios (RF-05) ---------- */
  const listarMinisterios = async () => revisar(await db().from("ministries")
    .select("id,name,description,coordinator_member_id,ministry_members(member_id)").eq("church_id", iglesia()).order("name"));
  async function guardarMinisterio(datos, integrantes) {
    const fila = { church_id: iglesia(), name: datos.name, description: datos.description || null, coordinator_member_id: datos.coordinator_member_id || null };
    const guardado = datos.id
      ? revisar(await db().from("ministries").update(fila).eq("id", datos.id).select().single())
      : revisar(await db().from("ministries").insert(fila).select().single());
    await reemplazarVinculos("ministry_members", "ministry_id", guardado.id, integrantes);
    return guardado;
  }
  const eliminarMinisterio = async (id) => revisar(await db().from("ministries").delete().eq("id", id));

  /** Deja en una tabla puente exactamente los miembros indicados. */
  async function reemplazarVinculos(tabla, columna, id, miembros) {
    const actuales = revisar(await db().from(tabla).select("member_id").eq(columna, id)).map((f) => f.member_id);
    const quitar = actuales.filter((m) => !miembros.includes(m));
    const agregar = miembros.filter((m) => !actuales.includes(m));
    if (quitar.length) revisar(await db().from(tabla).delete().eq(columna, id).in("member_id", quitar));
    if (agregar.length) revisar(await db().from(tabla).insert(agregar.map((m) => ({ [columna]: id, member_id: m }))));
  }

  /* ---------- Eventos (RF-04) ---------- */
  const CATEGORIAS_EVENTO = [["culto", "Culto"], ["reunion", "Reunión"], ["actividad", "Actividad"], ["religioso", "Evento religioso"], ["administrativo", "Evento administrativo"]];
  const ESTADOS_EVENTO = [["programado", "Programado"], ["realizado", "Realizado"], ["cancelado", "Cancelado"]];
  async function listarEventos({ desde, hasta } = {}) {
    let q = db().from("events")
      .select("id,title,category,event_type,starts_at,ends_at,venue,description,status,ministry_id,event_responsibles(member_id)")
      .eq("church_id", iglesia()).order("starts_at");
    if (desde) q = q.gte("starts_at", desde);
    if (hasta) q = q.lt("starts_at", hasta);
    return revisar(await q);
  }
  async function guardarEvento(datos, responsables) {
    const fila = {
      church_id: iglesia(), title: datos.title, category: datos.category || "actividad",
      starts_at: aInstante(datos.fecha, datos.hora), ends_at: datos.hora_fin ? aInstante(datos.fecha, datos.hora_fin) : null,
      venue: datos.venue || null, description: datos.description || null, status: datos.status || "programado",
      ministry_id: datos.ministry_id || null
    };
    let guardado;
    if (datos.id) guardado = revisar(await db().from("events").update(fila).eq("id", datos.id).select().single());
    else guardado = revisar(await db().from("events").insert({ ...fila, created_by: usuarioId() }).select().single());
    await reemplazarVinculos("event_responsibles", "event_id", guardado.id, responsables);
    return guardado;
  }
  const cambiarEstadoEvento = async (id, status) => revisar(await db().from("events").update({ status }).eq("id", id));

  /* ---------- Asistencia (RF-03) ---------- */
  const asistenciaDeEvento = async (eventoId) => revisar(await db().from("attendance")
    .select("member_id,present,recorded_at").eq("event_id", eventoId));
  async function guardarAsistencia(eventoId, marcas) {
    // marcas: [{ member_id, present }]
    if (!marcas.length) return;
    const filas = marcas.map((m) => ({ event_id: eventoId, member_id: m.member_id, present: m.present, recorded_by: usuarioId(), recorded_at: new Date().toISOString() }));
    revisar(await db().from("attendance").upsert(filas, { onConflict: "event_id,member_id" }));
  }
  /** Asistencias de todos los eventos de la iglesia en un periodo. */
  async function asistenciaPeriodo({ desde, hasta } = {}) {
    let q = db().from("attendance").select("event_id,member_id,present,events!inner(id,title,starts_at,church_id,category)")
      .eq("events.church_id", iglesia());
    if (desde) q = q.gte("events.starts_at", desde);
    if (hasta) q = q.lt("events.starts_at", hasta);
    return revisar(await q);
  }

  /* ---------- Donaciones (RF-06) ---------- */
  const METODOS_PAGO = [["efectivo", "Efectivo"], ["transferencia", "Transferencia"], ["tarjeta", "Tarjeta"], ["cheque", "Cheque"], ["deposito", "Depósito"], ["otro", "Otro"]];
  async function listarDonaciones({ desde, hasta } = {}) {
    let q = db().from("donations")
      .select("id,donated_on,amount,currency,concept,payment_method,donor_member_id,is_anonymous,notes,members(full_name)")
      .eq("church_id", iglesia()).order("donated_on", { ascending: false });
    if (desde) q = q.gte("donated_on", desde);
    if (hasta) q = q.lte("donated_on", hasta);
    return revisar(await q);
  }
  async function guardarDonacion(datos) {
    const anonimo = !!datos.is_anonymous;
    const fila = {
      church_id: iglesia(), donated_on: datos.donated_on || hoyISO(), amount: Number(datos.amount),
      concept: datos.concept, payment_method: datos.payment_method || null, is_anonymous: anonimo,
      donor_member_id: anonimo ? null : (datos.donor_member_id || null), notes: datos.notes || null
    };
    if (datos.id) return revisar(await db().from("donations").update(fila).eq("id", datos.id));
    return revisar(await db().from("donations").insert({ ...fila, recorded_by: usuarioId() }));
  }
  const eliminarDonacion = async (id) => revisar(await db().from("donations").delete().eq("id", id));

  /** Suma por mes "AAAA-MM" → total. */
  function totalesPorMes(donaciones) {
    const mapa = new Map();
    donaciones.forEach((d) => {
      const mes = d.donated_on.slice(0, 7);
      mapa.set(mes, (mapa.get(mes) || 0) + Number(d.amount));
    });
    return mapa;
  }
  function resumenDonaciones(donaciones) {
    const total = donaciones.reduce((s, d) => s + Number(d.amount), 0);
    const agrupar = (clave) => {
      const m = new Map();
      donaciones.forEach((d) => { const k = clave(d) || "Sin dato"; m.set(k, (m.get(k) || 0) + Number(d.amount)); });
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    };
    return {
      total, cantidad: donaciones.length,
      anonimas: donaciones.filter((d) => d.is_anonymous).length,
      porConcepto: agrupar((d) => d.concept),
      porMetodo: agrupar((d) => nombreDe(METODOS_PAGO, d.payment_method))
    };
  }

  /* ---------- Anuncios (RF-07) ---------- */
  const listarAnuncios = async () => revisar(await db().from("announcements")
    .select("id,title,body,published_on,expires_on,is_important,is_public").eq("church_id", iglesia())
    .order("published_on", { ascending: false }));
  async function guardarAnuncio(datos) {
    const fila = {
      church_id: iglesia(), title: datos.title, body: datos.body, published_on: datos.published_on || hoyISO(),
      expires_on: datos.expires_on || null, is_important: !!datos.is_important, is_public: datos.is_public !== false
    };
    if (datos.id) return revisar(await db().from("announcements").update(fila).eq("id", datos.id));
    return revisar(await db().from("announcements").insert({ ...fila, author_id: usuarioId() }));
  }
  const eliminarAnuncio = async (id) => revisar(await db().from("announcements").delete().eq("id", id));
  const anuncioVigente = (a) => a.published_on <= hoyISO() && (!a.expires_on || a.expires_on >= hoyISO());

  /* ---------- Configuración de la iglesia (RF-10) ---------- */
  const leerIglesia = async () => revisar(await db().from("churches")
    .select("id,name,short_name,address,phone,contact_email,website,logo_path,opening_hours").eq("id", iglesia()).single());
  async function guardarIglesia(datos) {
    const fila = {
      name: datos.name, short_name: datos.short_name || datos.name, address: datos.address || null,
      phone: datos.phone || null, contact_email: datos.contact_email || null, website: datos.website || null,
      logo_path: datos.logo_path || null, opening_hours: { reuniones: datos.reuniones || [] }
    };
    revisar(await db().from("churches").update(fila).eq("id", iglesia()));
    const local = sesion.iglesias.find((i) => i.id === iglesia());
    if (local) { local.name = fila.name; local.short_name = fila.short_name; }
  }
  /** opening_hours guarda { reuniones: [{ dia, hora, actividad }] }. */
  const reunionesDe = (horarios) => (Array.isArray(horarios?.reuniones) ? horarios.reuniones : []);

  /* ---------- Usuarios del sistema (RF-01, solo administrador) ---------- */
  const listarUsuarios = async () => revisar(await db().from("profiles")
    .select("user_id,full_name,app_role,church_id,is_active,created_at").order("full_name"));
  async function guardarUsuario(datos) {
    const fila = {
      full_name: datos.full_name, app_role: datos.app_role,
      church_id: datos.app_role === "administrador" ? (datos.church_id || null) : datos.church_id, is_active: datos.is_active !== false
    };
    revisar(await db().from("profiles").update(fila).eq("user_id", datos.user_id));
  }
  /**
   * Registra un usuario nuevo en Supabase Auth con un cliente aparte (no guarda sesión,
   * así el administrador no pierde la suya) y le asigna rol en "profiles".
   */
  async function registrarUsuario(datos) {
    const temporal = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "gestion-registro-temporal" }
    });
    const { data, error } = await temporal.auth.signUp({
      email: datos.email.trim().toLowerCase(), password: datos.password,
      options: { data: { full_name: datos.full_name }, emailRedirectTo: window.location.origin + window.location.pathname }
    });
    if (error) throw error;
    if (!data.user?.id) throw Object.assign(new Error("Supabase no devolvió el usuario."), { code: "sin_usuario" });
    // Si el correo ya existía, Supabase devuelve un usuario sin identidades
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw Object.assign(new Error("Ese correo ya tiene cuenta."), { code: "user_already_exists" });
    }
    const fila = {
      user_id: data.user.id, full_name: datos.full_name, app_role: datos.app_role,
      church_id: datos.church_id || null, is_active: true
    };
    revisar(await db().from("profiles").upsert(fila, { onConflict: "user_id" }));
    return { requiereConfirmacion: !data.session };
  }

  /* ---------- Panel principal (RF-08) ---------- */
  async function datosPanel() {
    const ahora = new Date();
    const hace6 = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);
    const [miembros, ministerios, proximos, recientes, anuncios, asistencias] = await Promise.all([
      db().from("members").select("id,is_active").eq("church_id", iglesia()).then(revisar),
      db().from("ministries").select("id", { count: "exact", head: true }).eq("church_id", iglesia()).then((r) => { if (r.error) throw r.error; return r.count || 0; }),
      db().from("events").select("id,title,starts_at,venue,category,status").eq("church_id", iglesia())
        .eq("status", "programado").gte("starts_at", ahora.toISOString()).order("starts_at").limit(6).then(revisar),
      db().from("events").select("id,title,starts_at,attendance(present)").eq("church_id", iglesia())
        .lte("starts_at", ahora.toISOString()).neq("status", "cancelado").order("starts_at", { ascending: false }).limit(8).then(revisar),
      db().from("announcements").select("id,title,body,published_on,expires_on,is_important").eq("church_id", iglesia())
        .order("published_on", { ascending: false }).limit(20).then(revisar),
      db().from("attendance").select("event_id,events!inner(church_id)", { count: "exact", head: true })
        .eq("events.church_id", iglesia()).eq("present", true).then((r) => { if (r.error) throw r.error; return r.count || 0; })
    ]);
    const datos = {
      miembrosActivos: miembros.filter((m) => m.is_active).length,
      miembrosInactivos: miembros.filter((m) => !m.is_active).length,
      ministerios, proximos, asistencias,
      anuncios: anuncios.filter(anuncioVigente).sort((a, b) => Number(b.is_important) - Number(a.is_important)).slice(0, 5),
      asistenciaReciente: recientes.reverse().map((e) => ({
        titulo: e.title, fecha: e.starts_at, presentes: (e.attendance || []).filter((a) => a.present).length
      })),
      finanzas: null
    };
    if (veFinanzas()) {
      const donaciones = await listarDonaciones({ desde: fechaISO(hace6) });
      const porMes = totalesPorMes(donaciones);
      const meses = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(hace6.getFullYear(), hace6.getMonth() + i, 1);
        const clave = `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}`;
        meses.push({ clave, fecha: d, total: porMes.get(clave) || 0 });
      }
      datos.finanzas = { meses, mesActual: meses[5].total, seisMeses: meses.reduce((s, m) => s + m.total, 0) };
    }
    return datos;
  }

  /* ---------- Utilidades de texto ---------- */
  function nombreDe(lista, valor) {
    const par = lista.find(([v]) => v === valor);
    return par ? par[1] : (valor || "");
  }
  const dinero = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  const fechaLarga = (iso) => (iso ? new Date(iso.length === 10 ? iso + "T12:00" : iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "");
  const fechaHora = (iso) => (iso ? new Date(iso).toLocaleString("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
  const nombreRol = (rol) => ({ administrador: "Administrador", pastor: "Pastor", secretario: "Secretario", tesorero: "Tesorero", coordinador: "Coordinador" }[rol] || rol);

  /** Traduce errores de Supabase a español sencillo. */
  function mensajeError(error) {
    const codigo = error?.code || "";
    if (codigo === "42501" || /row-level security|permission denied/i.test(error?.message || "")) return "No tienes permiso para hacer esto con tu rol.";
    if (codigo === "23505") return "Ya existe un registro con esos datos.";
    if (codigo === "23503") return "No se puede: hay registros que dependen de este.";
    if (codigo === "23514") return "Algún dato no es válido (revisa fechas y montos).";
    if (codigo === "user_already_exists" || codigo === "email_exists") return "Ya existe una cuenta con ese correo.";
    if (codigo === "weak_password") return "La contraseña es muy débil (mínimo 6 caracteres).";
    if (codigo === "over_email_send_rate_limit") return "Se enviaron demasiados correos. Espera unos minutos.";
    return "Ocurrió un error: " + (error?.message || "inténtalo de nuevo.");
  }

  return {
    ROLES, MODULOS, CATEGORIAS_EVENTO, ESTADOS_EVENTO, METODOS_PAGO, sesion,
    puede, veFinanzas, modulosVisibles, cargarSesion, limpiarSesion, elegirIglesia,
    fechaISO, horaHM, hoyISO, inicioSemana,
    listarMiembros, guardarMiembro, cambiarActivoMiembro,
    listarMinisterios, guardarMinisterio, eliminarMinisterio,
    listarEventos, guardarEvento, cambiarEstadoEvento,
    asistenciaDeEvento, guardarAsistencia, asistenciaPeriodo,
    listarDonaciones, guardarDonacion, eliminarDonacion, resumenDonaciones, totalesPorMes,
    listarAnuncios, guardarAnuncio, eliminarAnuncio, anuncioVigente,
    leerIglesia, guardarIglesia, reunionesDe,
    listarUsuarios, guardarUsuario, registrarUsuario,
    datosPanel, nombreDe, dinero, fechaLarga, fechaHora, nombreRol, mensajeError
  };
})();
