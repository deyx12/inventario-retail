export interface Producto {
  id: string;
  nombre: string;
  sku: string;
  codigo_barras: string | null;
  precio_costo: number;
  precio_venta: number;
  stock_minimo: number;
  categoria_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  categorias?: { nombre: string } | null;
}

export interface ProductoConStock extends Producto {
  stock_total: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  user_id: string;
  created_at: string;
}

export interface Almacen {
  id: string;
  nombre: string;
  ubicacion: string | null;
  user_id: string;
  created_at: string;
}
