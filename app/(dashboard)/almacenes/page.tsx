import { obtenerAlmacenes } from "@/features/productos/actions";
import AlmacenesClient from "@/features/productos/components/AlmacenesClient";

export default async function AlmacenesPage() {
  const almacenes = await obtenerAlmacenes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Almacenes</h1>
        <p className="text-muted-foreground">Gestiona tus almacenes y ubicaciones</p>
      </div>
      <AlmacenesClient almacenes={almacenes || []} />
    </div>
  );
}
