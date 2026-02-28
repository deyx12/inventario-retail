"use client";

import { useState, useEffect } from "react";
import BarcodeScanner from "@/features/scanner/components/BarcodeScanner";
import StockForm from "@/features/inventario/components/StockForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Producto } from "@/features/productos/types";
import type { Almacen } from "@/features/productos/types";

export default function ScannerPage() {
  const [productoEncontrado, setProductoEncontrado] = useState<Producto | null>(null);
  const [codigoManual, setCodigoManual] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const [{ data: prods }, { data: alms }] = await Promise.all([
        supabase.from("productos").select("*, categorias(nombre)").order("nombre"),
        supabase.from("almacenes").select("*").order("nombre"),
      ]);
      setProductos(prods || []);
      setAlmacenes(alms || []);
      setLoading(false);
    }
    loadData();
  }, []);

  async function buscarPorCodigo(codigo: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("productos")
      .select("*, categorias(nombre)")
      .eq("codigo_barras", codigo)
      .maybeSingle();

    if (data) {
      setProductoEncontrado(data);
      toast.success(`Producto encontrado: ${data.nombre}`);
    } else {
      toast.error(`No se encontró producto con código: ${codigo}`);
      setProductoEncontrado(null);
    }
  }

  function handleScan(code: string) {
    setCodigoManual(code);
    buscarPorCodigo(code);
  }

  function handleManualSearch() {
    if (codigoManual.trim()) {
      buscarPorCodigo(codigoManual.trim());
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scanner</h1>
        <p className="text-muted-foreground">Escanea códigos de barras para gestionar stock rápidamente</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <BarcodeScanner onScan={handleScan} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Búsqueda Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Código de barras..."
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                />
                <Button onClick={handleManualSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {productoEncontrado ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Producto Encontrado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-lg font-semibold">{productoEncontrado.nombre}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">SKU: {productoEncontrado.sku}</Badge>
                    {productoEncontrado.codigo_barras && (
                      <Badge variant="outline">CB: {productoEncontrado.codigo_barras}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
              <StockForm
                productos={productos}
                almacenes={almacenes}
                productoPreseleccionado={productoEncontrado.id}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Escanea un código de barras o búscalo manualmente para registrar un movimiento
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
