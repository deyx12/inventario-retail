import { obtenerProductos, obtenerAlmacenes } from "@/features/productos/actions";
import { obtenerInventario } from "@/features/inventario/actions";
import StockForm from "@/features/inventario/components/StockForm";
import StockTable from "@/features/inventario/components/StockTable";

export default async function StockPage() {
  const [productos, almacenes, inventario] = await Promise.all([
    obtenerProductos(),
    obtenerAlmacenes(),
    obtenerInventario(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Control de Stock</h1>
        <p className="text-muted-foreground">Registra entradas y salidas de inventario</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StockForm productos={productos || []} almacenes={almacenes || []} />
        <StockTable inventario={inventario || []} />
      </div>
    </div>
  );
}
