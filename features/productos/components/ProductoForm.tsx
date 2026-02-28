"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Producto, Categoria } from "@/features/productos/types";

interface ProductoFormProps {
  producto?: Producto | null;
  categorias: Categoria[];
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  onSuccess?: () => void;
}

export default function ProductoForm({ producto, categorias, onSubmit, onSuccess }: ProductoFormProps) {
  const [loading, setLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id || "none");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("categoria_id", categoriaId === "none" ? "" : categoriaId);
    const result = await onSubmit(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(producto ? "Producto actualizado" : "Producto creado");
      onSuccess?.();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" name="nombre" defaultValue={producto?.nombre} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" name="sku" defaultValue={producto?.sku} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigo_barras">Código de Barras</Label>
        <Input id="codigo_barras" name="codigo_barras" defaultValue={producto?.codigo_barras || ""} placeholder="Escanea o escribe el código" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="precio_costo">Precio Costo *</Label>
          <Input id="precio_costo" name="precio_costo" type="number" step="0.01" min="0" defaultValue={producto?.precio_costo || 0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precio_venta">Precio Venta *</Label>
          <Input id="precio_venta" name="precio_venta" type="number" step="0.01" min="0" defaultValue={producto?.precio_venta || 0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
          <Input id="stock_minimo" name="stock_minimo" type="number" min="0" defaultValue={producto?.stock_minimo || 0} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select value={categoriaId} onValueChange={setCategoriaId}>
          <SelectTrigger>
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin categoría</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {producto ? "Actualizar Producto" : "Crear Producto"}
      </Button>
    </form>
  );
}
