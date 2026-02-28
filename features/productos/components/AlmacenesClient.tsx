"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Warehouse, Loader2 } from "lucide-react";
import { crearAlmacen, eliminarAlmacen } from "@/features/productos/actions";
import { toast } from "sonner";
import type { Almacen } from "@/features/productos/types";
import EmptyState from "@/components/shared/EmptyState";

interface Props {
  almacenes: Almacen[];
}

export default function AlmacenesClient({ almacenes: initialAlmacenes }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleCrear(formData: FormData) {
    setLoading(true);
    const result = await crearAlmacen(formData);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Almacén creado");
    }
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar este almacén?")) return;
    const result = await eliminarAlmacen(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Almacén eliminado");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Nuevo Almacén</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCrear} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" name="nombre" required placeholder="Almacén Principal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" name="ubicacion" placeholder="Calle 1 #2-3" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Crear Almacén
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        {initialAlmacenes.length === 0 ? (
          <EmptyState
            title="No hay almacenes"
            description="Crea tu primer almacén para organizar tu inventario"
            icon={<Warehouse className="h-12 w-12" />}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialAlmacenes.map((almacen) => (
                  <TableRow key={almacen.id}>
                    <TableCell className="font-medium">{almacen.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{almacen.ubicacion || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEliminar(almacen.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
