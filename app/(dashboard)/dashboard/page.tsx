import { getDashboardMetrics, getProductosStockBajo } from "@/features/dashboard/actions";
import StatsCard from "@/features/dashboard/components/StatsCard";
import StockBajoList from "@/features/dashboard/components/StockBajoList";
import { formatCurrency } from "@/lib/utils/formatters";
import { DollarSign, Package, AlertTriangle, Warehouse } from "lucide-react";

export default async function DashboardPage() {
  const [metrics, stockBajo] = await Promise.all([
    getDashboardMetrics(),
    getProductosStockBajo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu inventario</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Valor del Inventario"
          value={formatCurrency(metrics.valorTotal)}
          icon={<DollarSign className="h-4 w-4" />}
          variant="success"
        />
        <StatsCard
          title="Total Productos"
          value={metrics.totalProductos}
          icon={<Package className="h-4 w-4" />}
        />
        <StatsCard
          title="Stock Bajo"
          value={metrics.productosStockBajo}
          description={metrics.productosStockBajo > 0 ? "Requieren atención" : "Todo en orden"}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={metrics.productosStockBajo > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Almacenes"
          value={metrics.totalAlmacenes}
          icon={<Warehouse className="h-4 w-4" />}
        />
      </div>

      <StockBajoList items={stockBajo || []} />
    </div>
  );
}
