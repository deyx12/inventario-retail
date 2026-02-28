"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { movimientoSchema } from "@/lib/utils/validators";

export async function registrarMovimiento(formData: FormData) {
  const rawData = {
    producto_id: formData.get("producto_id") as string,
    almacen_id: formData.get("almacen_id") as string,
    tipo: formData.get("tipo") as string,
    cantidad: formData.get("cantidad"),
    motivo: formData.get("motivo") as string,
  };

  const parsed = movimientoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.rpc("registrar_movimiento", {
    p_producto_id: parsed.data.producto_id,
    p_almacen_id: parsed.data.almacen_id,
    p_tipo: parsed.data.tipo,
    p_cantidad: parsed.data.cantidad,
    p_motivo: parsed.data.motivo || null,
    p_user_id: user.id,
  });

  if (error) {
    if (error.message.includes("Stock insuficiente")) {
      return { error: "Stock insuficiente para registrar esta salida" };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/reportes");
  return { success: true };
}

export async function obtenerInventario() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventario")
    .select("*, productos(nombre, sku, stock_minimo), almacenes(nombre)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("obtenerInventario error:", error.message);
    return [];
  }
  return data;
}

export async function obtenerMovimientos(filtros?: {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("movimientos")
    .select("*, productos(nombre, sku), almacenes(nombre)")
    .order("fecha", { ascending: false })
    .limit(200);

  if (filtros?.fechaDesde) {
    query = query.gte("fecha", filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    query = query.lte("fecha", `${filtros.fechaHasta}T23:59:59`);
  }
  if (filtros?.tipo && filtros.tipo !== "todos") {
    query = query.eq("tipo", filtros.tipo);
  }

  const { data, error } = await query;
  if (error) {
    console.error("obtenerMovimientos error:", error.message);
    return [];
  }
  return data;
}
