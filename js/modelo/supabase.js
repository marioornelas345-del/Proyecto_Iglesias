/* Cliente público de Supabase para la web estática.
   La publishable key está diseñada para usarse en el navegador; la seguridad
   depende de RLS. Nunca poner aquí una secret/service_role key. */
const SUPABASE_URL = "https://flgpibldureausqoddpb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vYuil2CC2khy4touY7xaDQ_JcTvsCYx";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
