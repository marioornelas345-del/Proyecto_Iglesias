/* Authentication centralizado en Supabase Auth. Nunca se guardan contraseñas
   en tablas propias ni en localStorage. */
function errorCuenta(code, mensaje = code) {
  return Object.assign(new Error(mensaje), { code });
}

function usuarioSupabase(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
    photoURL: user.user_metadata?.avatar_url || null,
    creada: user.created_at
  };
}

const CuentasSupabase = {
  permiteGoogle: true,

  async registrar({ nombre, correo, contrasena }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: correo.trim().toLowerCase(),
      password: contrasena,
      options: {
        data: { full_name: nombre.trim() },
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw errorCuenta(error.code || "auth/error", error.message);
    if (!data.session) return { requiereConfirmacion: true, email: correo };
    return usuarioSupabase(data.user);
  },

  async iniciarSesion({ correo, contrasena }) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: correo.trim().toLowerCase(), password: contrasena
    });
    if (error) throw errorCuenta(error.code || "auth/invalid-credential", error.message);
    return usuarioSupabase(data.user);
  },

  async cambiarNombre(usuario, nombre) {
    const { error: authError } = await supabaseClient.auth.updateUser({ data: { full_name: nombre } });
    if (authError) throw authError;
    const { error } = await supabaseClient.from("perfiles").update({ nombre }).eq("usuario_id", usuario.id);
    if (error) throw error;
  },

  async cambiarContrasena(contrasena) {
    const { data, error } = await supabaseClient.auth.updateUser({ password: contrasena });
    if (error) throw errorCuenta(error.code || "auth/error", error.message);
    return usuarioSupabase(data.user);
  },

  async eliminar() {
    // Eliminar un usuario de Auth requiere una Edge Function con service role.
    // Nunca se expone esa clave en el navegador.
    throw errorCuenta("auth/delete-not-configured", "La eliminación segura de cuentas requiere configurar una Edge Function.");
  },

  pideContrasena: () => false,

  async entrarConGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) throw error;
    return null;
  },

  async recuperarContrasena(correo) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(correo.trim().toLowerCase(), {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) throw error;
  },

  async cerrarSesion() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  alCambiarSesion(funcion) {
    return supabaseClient.auth.onAuthStateChange((evento, session) => {
      funcion(usuarioSupabase(session?.user || null), evento);
    }).data.subscription.unsubscribe;
  }
};
