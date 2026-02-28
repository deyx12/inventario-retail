"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Camera, CameraOff } from "lucide-react";

interface Props {
  onScan: (code: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  async function startScanner() {
    setError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // Ignore scan failures (noise)
        }
      );
    } catch (err) {
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    try {
      const scanner = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void } | null;
      if (scanner) {
        await scanner.stop();
        scanner.clear();
      }
    } catch {
      // Ignore stop errors
    }
    html5QrCodeRef.current = null;
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          Escáner de Código de Barras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          id="barcode-reader"
          ref={scannerRef}
          className="mx-auto overflow-hidden rounded-lg bg-muted"
          style={{ maxWidth: 400, minHeight: scanning ? 300 : 0 }}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={scanning ? stopScanner : startScanner}
          variant={scanning ? "destructive" : "default"}
          className="w-full"
        >
          {scanning ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              Detener Escáner
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Escáner
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
