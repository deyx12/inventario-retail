import { obtenerCategorias, crearProducto } from "@/features/productos/actions";
import ProductoFormPage from "@/features/productos/components/ProductoFormPage";

export default async function NuevoProductoPage() {
  const categorias = await obtenerCategorias();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
        <p className="text-muted-foreground">Agrega un producto a tu inventario</p>
      </div>
      <ProductoFormPage categorias={categorias || []} />
    </div>
  );
}
