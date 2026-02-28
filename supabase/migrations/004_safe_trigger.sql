-- ============================================
-- FIX v2: Fault-tolerant trigger
-- The trigger will NEVER block user creation
-- ============================================

-- Clean orphan profiles
DELETE FROM perfiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Replace trigger function with exception handler
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM perfiles WHERE email = NEW.email AND id != NEW.id;
  INSERT INTO perfiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let trigger failure prevent user creation
  RAISE WARNING 'crear_perfil_usuario failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_usuario();
