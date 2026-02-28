import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { Inventario } from "@/features/inventario/types";
import EmptyState from "@/components/shared/EmptyState";

interface Props {
  inventario: Inventario[];
}

export default function StockTable({ inventario }: Props) {
  if (inventario.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventario Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Sin inventario"
            description="Registra tu primer movimiento para ver el inventario"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inventario Actual</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventario.map((item) => {
                const prod = item.productos as unknown as { nombre: string; sku: string; stock_minimo: number } | null;
                const alm = item.almacenes as unknown as { nombre: string } | null;
                const isLow = prod && item.cantidad <= prod.stock_minimo;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{prod?.nombre || "—"}</span>
                        <span className="block text-xs text-muted-foreground">{prod?.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{alm?.nombre || "—"}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{item.cantidad}</TableCell>
                    <TableCell className="text-center">
                      {isLow ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Bajo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
