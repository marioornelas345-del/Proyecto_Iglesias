# Conexión de Supabase

La web usa Supabase Auth para registro, inicio de sesión, confirmación y recuperación por correo. Los perfiles y las iglesias visitadas se guardan en `public.perfiles` y `public.iglesias_visitadas`.

## Configuración pendiente en el Dashboard

1. En **Authentication → URL Configuration**, agrega como Site URL la dirección donde sirves la web. Para desarrollo con el script del proyecto, agrega `http://localhost:5173/**` a Redirect URLs. Agrega también la URL final de producción cuando exista.
2. En **Authentication → Providers → Email**, habilita correo/contraseña y configura el envío de confirmación/restablecimiento. Para pruebas, revisa también la plantilla de correo y el límite de envío del proyecto.
3. El botón Google requiere habilitar **Google** en Providers y configurar sus credenciales OAuth y el callback que muestra Supabase. Hasta entonces, correo/contraseña funciona independientemente.
4. Asegúrate de que ya están creadas las tablas españolas `iglesias`, `perfiles` e `iglesias_visitadas`, el trigger de creación de perfil y las políticas RLS del esquema del proyecto. No ejecutes otra vez un script que vuelva a crear tablas existentes.

## Gestión de la iglesia (`#gestion`)

El módulo de gestión usa las tablas del esquema `merida-sacra-supabase.sql`: `profiles` (rol), `members`, `events`, `event_responsibles`, `attendance`, `ministries`, `ministry_members`, `donations`, `announcements` y `churches`.

1. Ejecuta una vez `supabase/primer-administrador.sql` (con tu correo) para crear el primer administrador.
2. Entra a la página: aparece el enlace **Gestión** en la barra. Solo lo ven las cuentas con fila activa en `profiles`.
3. Desde **Gestión → Usuarios** el administrador registra a pastores, secretarios, tesoreros y coordinadores y les asigna una iglesia.
4. Si "Confirm email" está activado en Supabase, cada usuario nuevo debe confirmar su correo antes de entrar.

El logotipo se guarda reducido (máx. 256 px) en `churches.logo_path`, y los horarios habituales se guardan en `churches.opening_hours` como `{ "reuniones": [{ "dia", "hora", "actividad" }] }`.

La URL y la publishable key están en `js/modelo/supabase.js`. La publishable key está destinada al cliente: RLS debe proteger todas las filas privadas. No agregues una `secret key` ni una `service_role key` al código del navegador.

La eliminación de usuarios de Supabase Auth no se ejecuta desde el navegador: requiere una Edge Function con una clave privilegiada solo en el entorno del servidor. Esa parte se debe configurar antes de ofrecer la eliminación de cuenta.
