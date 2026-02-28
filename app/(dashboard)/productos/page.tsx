import { obtenerProductos } from "@/features/productos/actions";
import ProductoListClient from "@/features/productos/components/ProductoListClient";

export default async function ProductosPage() {
  const productos = await obtenerProductos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
      </div>
      <ProductoListClient productosIniciales={productos || []} />
    </div>
  );
}
