"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { registrarMovimiento } from "@/features/inventario/actions";
import { toast } from "sonner";
import type { Producto } from "@/features/productos/types";
import type { Almacen } from "@/features/productos/types";

interface Props {
  productos: Producto[];
  almacenes: Almacen[];
  productoPreseleccionado?: string;
}

export default function StockForm({ productos, almacenes, productoPreseleccionado }: Props) {
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<string>("entrada");
  const [productoId, setProductoId] = useState(productoPreseleccionado || "");
  const [almacenId, setAlmacenId] = useState(almacenes[0]?.id || "");

  async function handleSubmit(formData: FormData) {
    formData.set("producto_id", productoId);
    formData.set("almacen_id", almacenId);
    formData.set("tipo", tipo);

    setLoading(true);
    const result = await registrarMovimiento(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        tipo === "entrada" ? "Entrada registrada" : "Salida registrada"
      );
      // Reset form
      setProductoId(productoPreseleccionado || "");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tipo === "entrada" ? (
            <ArrowDownToLine className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowUpFromLine className="h-5 w-5 text-red-500" />
          )}
          Registrar Movimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">📥 Entrada</SelectItem>
                  <SelectItem value="salida">📤 Salida</SelectItem>
                  <SelectItem value="ajuste">🔧 Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Almacén *</Label>
              <Select value={almacenId} onValueChange={setAlmacenId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona almacén" />
                </SelectTrigger>
                <SelectContent>
                  {almacenes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Producto *</Label>
            <Select value={productoId} onValueChange={setProductoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input id="cantidad" name="cantidad" type="number" min="1" required placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input id="motivo" name="motivo" placeholder="Compra, venta, ajuste..." />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !productoId || !almacenId}
            className="w-full"
            variant={tipo === "salida" ? "destructive" : "default"}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tipo === "entrada" ? "Registrar Entrada" : tipo === "salida" ? "Registrar Salida" : "Registrar Ajuste"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
