import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(200),
  sku: z.string().min(1, "El SKU es obligatorio").max(50),
  codigo_barras: z.string().max(100).optional().or(z.literal("")),
  precio_costo: z.coerce.number().min(0, "El precio debe ser positivo"),
  precio_venta: z.coerce.number().min(0, "El precio debe ser positivo"),
  stock_minimo: z.coerce.number().int().min(0, "Debe ser un número entero positivo"),
  categoria_id: z.string().uuid().optional().or(z.literal("")),
});

export const categoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
});

export const almacenSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(200),
  ubicacion: z.string().max(500).optional().or(z.literal("")),
});

export const movimientoSchema = z.object({
  producto_id: z.string().uuid("Producto inválido"),
  almacen_id: z.string().uuid("Almacén inválido"),
  tipo: z.enum(["entrada", "salida", "ajuste"] as const, {
    message: "Tipo de movimiento inválido",
  }),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  motivo: z.string().max(500).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre_tienda: z.string().min(1, "El nombre de la tienda es obligatorio").max(200),
});

export type ProductoFormData = z.infer<typeof productoSchema>;
export type CategoriaFormData = z.infer<typeof categoriaSchema>;
export type AlmacenFormData = z.infer<typeof almacenSchema>;
export type MovimientoFormData = z.infer<typeof movimientoSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistroFormData = z.infer<typeof registroSchema>;
