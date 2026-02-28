"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters";
import type { Movimiento } from "@/features/inventario/types";
import EmptyState from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

interface Props {
  movimientos: Movimiento[];
}

const tipoBadge = {
  entrada: { label: "Entrada", variant: "default" as const },
  salida: { label: "Salida", variant: "destructive" as const },
  ajuste: { label: "Ajuste", variant: "secondary" as const },
};

export default function MovimientosTable({ movimientos }: Props) {
  if (movimientos.length === 0) {
    return (
      <EmptyState
        title="Sin movimientos"
        description="Registra entradas y salidas para ver el historial"
        icon={<FileText className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="hidden sm:table-cell">Almacén</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead className="hidden md:table-cell">Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((mov) => {
            const prod = mov.productos as unknown as { nombre: string; sku: string } | null;
            const alm = mov.almacenes as unknown as { nombre: string } | null;
            const badge = tipoBadge[mov.tipo];
            return (
              <TableRow key={mov.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(mov.fecha)}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{prod?.nombre || "—"}</span>
                  <span className="block text-xs text-muted-foreground">{prod?.sku}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {alm?.nombre || "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono font-bold">
                  {mov.tipo === "entrada" ? "+" : "-"}{mov.cantidad}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {mov.motivo || "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
