export interface Inventario {
  id: string;
  producto_id: string;
  almacen_id: string;
  cantidad: number;
  updated_at: string;
  productos?: {
    nombre: string;
    sku: string;
    stock_minimo: number;
  };
  almacenes?: {
    nombre: string;
  };
}

export interface Movimiento {
  id: string;
  producto_id: string;
  almacen_id: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo: string | null;
  user_id: string;
  fecha: string;
  productos?: {
    nombre: string;
    sku: string;
  };
  almacenes?: {
    nombre: string;
  };
}
