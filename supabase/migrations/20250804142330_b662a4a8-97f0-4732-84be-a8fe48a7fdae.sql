-- Verificar y recrear el trigger para crear perfiles automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recrear la función handle_new_user para que funcione correctamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insertar el perfil solo si no existe ya
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- También asegurar que el usuario actual tenga un perfil
DO $$
BEGIN
  -- Insertar perfiles para usuarios existentes que no tengan uno
  INSERT INTO public.profiles (id, email, plan, daily_usage_count, last_usage_reset, created_at, updated_at)
  SELECT 
    au.id, 
    au.email,
    'gratuito'::user_plan,
    0,
    now(),
    au.created_at,
    now()
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
END $$;