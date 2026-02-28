import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface StockBajoItem {
  cantidad: number;
  productos: unknown;
  almacenes: unknown;
}

interface Props {
  items: StockBajoItem[];
}

export default function StockBajoList({ items }: Props) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ✅ Todos los productos tienen stock suficiente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Stock Bajo ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Almacén</TableHead>
                <TableHead className="text-center">Actual</TableHead>
                <TableHead className="text-center">Mínimo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => {
                const prod = item.productos as { nombre: string; sku: string; stock_minimo: number } | null;
                const alm = item.almacenes as { nombre: string } | null;
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <span className="font-medium">{prod?.nombre || "—"}</span>
                      <span className="block text-xs text-muted-foreground">{prod?.sku}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{alm?.nombre || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">{item.cantidad}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {prod?.stock_minimo}
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
