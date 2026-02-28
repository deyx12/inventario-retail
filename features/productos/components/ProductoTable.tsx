"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { eliminarProducto } from "@/features/productos/actions";
import { toast } from "sonner";
import type { Producto } from "@/features/productos/types";
import EmptyState from "@/components/shared/EmptyState";

interface ProductoTableProps {
  productos: Producto[];
  onBuscar: (busqueda: string) => void;
}

export default function ProductoTable({ productos, onBuscar }: ProductoTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleBuscar(value: string) {
    setBusqueda(value);
    onBuscar(value);
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    setDeleting(id);
    const result = await eliminarProducto(id);
    setDeleting(null);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Producto eliminado");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => handleBuscar(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link href="/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {productos.length === 0 ? (
        <EmptyState
          title="No hay productos"
          description="Crea tu primer producto para empezar a gestionar tu inventario"
          action={
            <Link href="/productos/nuevo">
              <Button><Plus className="mr-2 h-4 w-4" />Crear Producto</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">P. Costo</TableHead>
                <TableHead className="text-right">P. Venta</TableHead>
                <TableHead className="text-center">Stock Mín.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">
                    <Link href={`/productos/${producto.id}`} className="hover:underline">
                      {producto.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{producto.sku}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {producto.categorias?.nombre ? (
                      <Badge variant="secondary">{producto.categorias.nombre}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(producto.precio_costo)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(producto.precio_venta)}</TableCell>
                  <TableCell className="text-center">{producto.stock_minimo}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/productos/${producto.id}`}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEliminar(producto.id)}
                        disabled={deleting === producto.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
