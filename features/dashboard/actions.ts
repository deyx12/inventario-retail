"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  valorTotal: number;
  totalProductos: number;
  productosStockBajo: number;
  totalAlmacenes: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  // Total products
  const { count: totalProductos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true });

  // Products with low stock (using inventario aggregate)
  const { data: inventarioData } = await supabase
    .from("inventario")
    .select("cantidad, productos(precio_venta, stock_minimo)");

  let valorTotal = 0;
  let productosStockBajo = 0;
  const productosCantidades: Record<string, { cantidad: number; stock_minimo: number }> = {};

  if (inventarioData) {
    for (const item of inventarioData) {
      const prod = item.productos as unknown as { precio_venta: number; stock_minimo: number } | null;
      if (prod) {
        valorTotal += item.cantidad * prod.precio_venta;
        if (item.cantidad <= prod.stock_minimo) {
          productosStockBajo++;
        }
      }
    }
  }

  // Total almacenes
  const { count: totalAlmacenes } = await supabase
    .from("almacenes")
    .select("*", { count: "exact", head: true });

  return {
    valorTotal,
    totalProductos: totalProductos || 0,
    productosStockBajo,
    totalAlmacenes: totalAlmacenes || 0,
  };
}

export async function getProductosStockBajo() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventario")
    .select("cantidad, productos(id, nombre, sku, stock_minimo, precio_venta), almacenes(nombre)")
    .order("cantidad", { ascending: true });

  if (error) throw new Error(error.message);

  // Filter for low stock
  return (data || []).filter((item) => {
    const prod = item.productos as unknown as { stock_minimo: number } | null;
    return prod && item.cantidad <= prod.stock_minimo;
  });
}
