import { obtenerProductoPorId, obtenerCategorias } from "@/features/productos/actions";
import ProductoFormPage from "@/features/productos/components/ProductoFormPage";
import { notFound } from "next/navigation";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let producto;
  try {
    producto = await obtenerProductoPorId(id);
  } catch {
    notFound();
  }

  const categorias = await obtenerCategorias();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Producto</h1>
        <p className="text-muted-foreground">{producto.nombre}</p>
      </div>
      <ProductoFormPage producto={producto} categorias={categorias || []} />
    </div>
  );
}
