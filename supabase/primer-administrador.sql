-- =========================================================
-- PRIMER ADMINISTRADOR DE LA GESTIÓN
-- Ejecútalo UNA vez en Supabase → SQL Editor.
-- Las políticas RLS no dejan que una cuenta se dé un rol a sí misma,
-- así que el primer administrador se crea aquí. Después, el
-- administrador registra a los demás usuarios desde la página
-- (Gestión → Usuarios) y les asigna su rol.
--
-- 1) Crea tu cuenta en la página (Crear cuenta) y confirma el correo.
-- 2) Cambia el correo de abajo por el tuyo y ejecuta el script.
-- =========================================================
insert into public.profiles (user_id, full_name, app_role, church_id, is_active)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       'administrador',
       null,          -- el administrador trabaja con todas las iglesias
       true
from auth.users u
where u.email = lower('TU_CORREO@ejemplo.com')
on conflict (user_id) do update
  set app_role = 'administrador', is_active = true;

-- Comprueba el resultado:
select p.full_name, p.app_role, p.church_id, u.email
from public.profiles p join auth.users u on u.id = p.user_id;
