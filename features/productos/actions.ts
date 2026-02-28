"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { productoSchema, categoriaSchema, almacenSchema } from "@/lib/utils/validators";

// ===================== PRODUCTOS =====================

export async function obtenerProductos(busqueda?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .order("created_at", { ascending: false });

  if (busqueda) {
    query = query.or(`nombre.ilike.%${busqueda}%,sku.ilike.%${busqueda}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerProductoPorId(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function obtenerProductoPorCodigoBarras(codigo: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .eq("codigo_barras", codigo)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function crearProducto(formData: FormData) {
  const rawData = {
    nombre: formData.get("nombre") as string,
    sku: formData.get("sku") as string,
    codigo_barras: formData.get("codigo_barras") as string,
    precio_costo: formData.get("precio_costo"),
    precio_venta: formData.get("precio_venta"),
    stock_minimo: formData.get("stock_minimo"),
    categoria_id: formData.get("categoria_id") as string,
  };

  const parsed = productoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("productos").insert({
    ...parsed.data,
    codigo_barras: parsed.data.codigo_barras || null,
    categoria_id: parsed.data.categoria_id || null,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con ese SKU o código de barras" };
    return { error: error.message };
  }

  revalidatePath("/productos");
  return { success: true };
}

export async function actualizarProducto(id: string, formData: FormData) {
  const rawData = {
    nombre: formData.get("nombre") as string,
    sku: formData.get("sku") as string,
    codigo_barras: formData.get("codigo_barras") as string,
    precio_costo: formData.get("precio_costo"),
    precio_venta: formData.get("precio_venta"),
    stock_minimo: formData.get("stock_minimo"),
    categoria_id: formData.get("categoria_id") as string,
  };

  const parsed = productoSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({
      ...parsed.data,
      codigo_barras: parsed.data.codigo_barras || null,
      categoria_id: parsed.data.categoria_id || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un producto con ese SKU o código de barras" };
    return { error: error.message };
  }

  revalidatePath("/productos");
  revalidatePath(`/productos/${id}`);
  return { success: true };
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/productos");
  return { success: true };
}

// ===================== CATEGORÍAS =====================

export async function obtenerCategorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function crearCategoria(formData: FormData) {
  const parsed = categoriaSchema.safeParse({
    nombre: formData.get("nombre") as string,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("categorias")
    .insert({ nombre: parsed.data.nombre, user_id: user.id });

  if (error) return { error: error.message };

  revalidatePath("/productos");
  return { success: true };
}

export async function eliminarCategoria(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/productos");
  return { success: true };
}

// ===================== ALMACENES =====================

export async function obtenerAlmacenes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("almacenes")
    .select("*")
    .order("nombre");

  if (error) throw new Error(error.message);
  return data;
}

export async function crearAlmacen(formData: FormData) {
  const parsed = almacenSchema.safeParse({
    nombre: formData.get("nombre") as string,
    ubicacion: formData.get("ubicacion") as string,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("almacenes")
    .insert({ ...parsed.data, ubicacion: parsed.data.ubicacion || null, user_id: user.id });

  if (error) return { error: error.message };

  revalidatePath("/almacenes");
  return { success: true };
}

export async function eliminarAlmacen(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("almacenes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/almacenes");
  return { success: true };
}
