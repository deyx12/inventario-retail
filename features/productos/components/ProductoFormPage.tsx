"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import ProductoForm from "./ProductoForm";
import { crearProducto, actualizarProducto } from "@/features/productos/actions";
import type { Producto, Categoria } from "@/features/productos/types";

interface Props {
  producto?: Producto | null;
  categorias: Categoria[];
}

export default function ProductoFormPage({ producto, categorias }: Props) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (producto) {
      return actualizarProducto(producto.id, formData);
    }
    return crearProducto(formData);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ProductoForm
          producto={producto}
          categorias={categorias}
          onSubmit={handleSubmit}
          onSuccess={() => router.push("/productos")}
        />
      </CardContent>
    </Card>
  );
}
