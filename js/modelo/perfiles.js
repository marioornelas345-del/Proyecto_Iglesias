/* Perfiles e iglesias visitadas se sincronizan con Supabase. El caché solo vive
   en memoria; no contiene credenciales ni sustituye las políticas RLS. */
const perfilesEnMemoria = new Map();
const usuarioPorCorreo = new Map();

const Perfiles = {
  async cargar(usuario) {
    if (!usuario?.id || !usuario?.email) return {};
    usuarioPorCorreo.set(usuario.email, usuario);
    const [{ data: fila, error: errorPerfil }, { data: visitas, error: errorVisitas }] = await Promise.all([
      supabaseClient.from("perfiles").select("nombre,foto,ciudad,libros_leidos,sobre_mi,iglesia_favorita_id").eq("usuario_id", usuario.id).maybeSingle(),
      supabaseClient.from("iglesias_visitadas").select("iglesia_id").eq("usuario_id", usuario.id)
    ]);
    if (errorPerfil) throw errorPerfil;
    if (errorVisitas) throw errorVisitas;
    const perfil = {
      nombre: fila?.nombre || usuario.displayName || "",
      foto: fila?.foto || null,
      ciudad: fila?.ciudad || "",
      librosLeidos: fila?.libros_leidos ?? "",
      sobre: fila?.sobre_mi || "",
      favorita: fila?.iglesia_favorita_id || "",
      visitadas: (visitas || []).map((v) => v.iglesia_id)
    };
    perfilesEnMemoria.set(usuario.email, perfil);
    return perfil;
  },

  leer(correo) { return perfilesEnMemoria.get(correo) || {}; },

  async guardar(correo, cambios) {
    const usuario = usuarioPorCorreo.get(correo);
    if (!usuario?.id) throw new Error("No hay una sesión de Supabase activa.");
    const anterior = this.leer(correo);
    const siguiente = { ...anterior, ...cambios };
    const payload = {
      usuario_id: usuario.id,
      nombre: siguiente.nombre || usuario.displayName || "",
      foto: siguiente.foto || null,
      ciudad: siguiente.ciudad || null,
      libros_leidos: Number(siguiente.librosLeidos) || 0,
      sobre_mi: siguiente.sobre || null,
      iglesia_favorita_id: siguiente.favorita || null
    };
    const { error } = await supabaseClient.from("perfiles").upsert(payload, { onConflict: "usuario_id" });
    if (error) throw error;
    perfilesEnMemoria.set(correo, siguiente);
    return true;
  },

  async eliminar(correo) {
    const usuario = usuarioPorCorreo.get(correo);
    if (usuario?.id) {
      const { error } = await supabaseClient.from("perfiles").delete().eq("usuario_id", usuario.id);
      if (error) throw error;
    }
    perfilesEnMemoria.delete(correo);
    usuarioPorCorreo.delete(correo);
  },

  async alternarVisitada(correo, clave) {
    const usuario = usuarioPorCorreo.get(correo);
    if (!usuario?.id) throw new Error("No hay una sesión de Supabase activa.");
    const perfil = this.leer(correo);
    const visitadas = new Set(perfil.visitadas || []);
    if (visitadas.has(clave)) {
      const { error } = await supabaseClient.from("iglesias_visitadas").delete().eq("usuario_id", usuario.id).eq("iglesia_id", clave);
      if (error) throw error;
      visitadas.delete(clave);
    } else {
      const { error } = await supabaseClient.from("iglesias_visitadas").upsert({ usuario_id: usuario.id, iglesia_id: clave }, { onConflict: "usuario_id,iglesia_id" });
      if (error) throw error;
      visitadas.add(clave);
    }
    const lista = [...visitadas];
    perfilesEnMemoria.set(correo, { ...perfil, visitadas: lista });
    return lista;
  }
};

function nombreDeUsuario(usuario) {
  return Perfiles.leer(usuario.email).nombre || usuario.displayName || usuario.email.split("@")[0];
}
