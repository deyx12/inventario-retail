"use client";

import { useState, useTransition } from "react";
import FiltrosReportes from "@/features/reportes/components/FiltrosReportes";
import MovimientosTable from "@/features/reportes/components/MovimientosTable";
import { obtenerMovimientos } from "@/features/inventario/actions";
import type { Movimiento } from "@/features/inventario/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function ReportesPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFiltrar(filtros: { fechaDesde: string; fechaHasta: string; tipo: string }) {
    startTransition(async () => {
      try {
        const data = await obtenerMovimientos({
          fechaDesde: filtros.fechaDesde || undefined,
          fechaHasta: filtros.fechaHasta || undefined,
          tipo: filtros.tipo || undefined,
        });
        setMovimientos(data || []);
        setLoaded(true);
      } catch {
        toast.error("Error al cargar movimientos");
      }
    });
  }

  function handleExportCSV() {
    if (movimientos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const headers = ["Fecha", "Producto", "SKU", "Almacén", "Tipo", "Cantidad", "Motivo"];
    const rows = movimientos.map((m) => {
      const prod = m.productos as unknown as { nombre: string; sku: string } | null;
      const alm = m.almacenes as unknown as { nombre: string } | null;
      return [
        new Date(m.fecha).toLocaleDateString("es-CO"),
        prod?.nombre || "",
        prod?.sku || "",
        alm?.nombre || "",
        m.tipo,
        m.cantidad.toString(),
        m.motivo || "",
      ];
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Historial de movimientos de inventario</p>
      </div>

      <FiltrosReportes onFiltrar={handleFiltrar} onExportCSV={handleExportCSV} />

      {isPending ? (
        <LoadingSpinner />
      ) : loaded ? (
        <MovimientosTable movimientos={movimientos} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Usa los filtros para consultar el historial de movimientos
        </div>
      )}
    </div>
  );
}
