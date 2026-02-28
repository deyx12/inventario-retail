-- ============================================
-- SCHEMA: Sistema de Gestión de Inventario
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: perfiles
-- ============================================
CREATE TABLE perfiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  nombre_tienda TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve su propio perfil"
  ON perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuario actualiza su propio perfil"
  ON perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuario crea su propio perfil"
  ON perfiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLA: almacenes
-- ============================================
CREATE TABLE almacenes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  ubicacion   TEXT,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE almacenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD propio almacen"
  ON almacenes FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE categorias (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD propia categoria"
  ON categorias FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE productos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL,
  sku             TEXT NOT NULL,
  codigo_barras   TEXT,
  precio_costo    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  precio_venta    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_minimo    INTEGER NOT NULL DEFAULT 0,
  categoria_id    UUID REFERENCES categorias(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku, user_id),
  UNIQUE(codigo_barras, user_id)
);

CREATE INDEX idx_productos_user_id     ON productos(user_id);
CREATE INDEX idx_productos_sku         ON productos(sku);
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD propio producto"
  ON productos FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLA: inventario
-- ============================================
CREATE TABLE inventario (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  almacen_id  UUID NOT NULL REFERENCES almacenes(id) ON DELETE CASCADE,
  cantidad    INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, almacen_id)
);

CREATE INDEX idx_inventario_producto_id ON inventario(producto_id);

ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver inventario propio"
  ON inventario FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM productos p
      WHERE p.id = inventario.producto_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Modificar inventario propio"
  ON inventario FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM productos p
      WHERE p.id = inventario.producto_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM productos p
      WHERE p.id = inventario.producto_id AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- TABLA: movimientos
-- ============================================
CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida', 'ajuste');

CREATE TABLE movimientos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  almacen_id  UUID NOT NULL REFERENCES almacenes(id) ON DELETE CASCADE,
  tipo        tipo_movimiento NOT NULL,
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  motivo      TEXT,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movimientos_producto_id ON movimientos(producto_id);
CREATE INDEX idx_movimientos_fecha       ON movimientos(fecha DESC);
CREATE INDEX idx_movimientos_user_id     ON movimientos(user_id);

ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CRUD propio movimiento"
  ON movimientos FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN: Trigger para actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_productos
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_inventario
  BEFORE UPDATE ON inventario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Registrar movimiento y actualizar stock
-- ============================================
CREATE OR REPLACE FUNCTION registrar_movimiento(
  p_producto_id UUID,
  p_almacen_id  UUID,
  p_tipo        tipo_movimiento,
  p_cantidad    INTEGER,
  p_motivo      TEXT,
  p_user_id     UUID
) RETURNS void AS $$
BEGIN
  INSERT INTO movimientos (producto_id, almacen_id, tipo, cantidad, motivo, user_id)
  VALUES (p_producto_id, p_almacen_id, p_tipo, p_cantidad, p_motivo, p_user_id);

  INSERT INTO inventario (producto_id, almacen_id, cantidad)
  VALUES (p_producto_id, p_almacen_id, 
    CASE p_tipo WHEN 'entrada' THEN p_cantidad ELSE -p_cantidad END)
  ON CONFLICT (producto_id, almacen_id)
  DO UPDATE SET
    cantidad = inventario.cantidad + 
      CASE p_tipo WHEN 'entrada' THEN p_cantidad ELSE -p_cantidad END,
    updated_at = NOW();

  IF (SELECT cantidad FROM inventario WHERE producto_id = p_producto_id AND almacen_id = p_almacen_id) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para registrar salida';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-CREAR PERFIL al registrar usuario
-- ============================================
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_usuario();
