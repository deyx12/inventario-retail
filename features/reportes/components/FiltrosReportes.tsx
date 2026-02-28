"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download } from "lucide-react";

interface Props {
  onFiltrar: (filtros: { fechaDesde: string; fechaHasta: string; tipo: string }) => void;
  onExportCSV: () => void;
}

export default function FiltrosReportes({ onFiltrar, onExportCSV }: Props) {
  function handleSubmit(formData: FormData) {
    onFiltrar({
      fechaDesde: formData.get("fechaDesde") as string,
      fechaHasta: formData.get("fechaHasta") as string,
      tipo: formData.get("tipo") as string,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="fechaDesde">Desde</Label>
            <Input id="fechaDesde" name="fechaDesde" type="date" />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="fechaHasta">Hasta</Label>
            <Input id="fechaHasta" name="fechaHasta" type="date" />
          </div>
          <div className="space-y-2 flex-1">
            <Label>Tipo</Label>
            <Select name="tipo" defaultValue="todos">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button type="button" variant="outline" onClick={onExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
