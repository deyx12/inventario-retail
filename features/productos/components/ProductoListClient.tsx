"use client";

import { useState, useTransition } from "react";
import ProductoTable from "./ProductoTable";
import { obtenerProductos } from "@/features/productos/actions";
import type { Producto } from "@/features/productos/types";

interface Props {
  productosIniciales: Producto[];
}

export default function ProductoListClient({ productosIniciales }: Props) {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [isPending, startTransition] = useTransition();

  function handleBuscar(busqueda: string) {
    startTransition(async () => {
      const data = await obtenerProductos(busqueda || undefined);
      setProductos(data || []);
    });
  }

  return <ProductoTable productos={productos} onBuscar={handleBuscar} />;
}
