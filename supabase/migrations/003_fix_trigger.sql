-- ============================================
-- FIX: Clean orphan profiles + robust trigger
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Delete orphan profiles (profiles whose auth user was deleted)
DELETE FROM perfiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. Replace the trigger function to handle BOTH id and email conflicts
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove any orphan profile with same email but different id
  DELETE FROM perfiles WHERE email = NEW.email AND id != NEW.id;

  -- Upsert: insert or update if id already exists
  INSERT INTO perfiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_usuario();
