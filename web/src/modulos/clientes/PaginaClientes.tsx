import { puede } from "@aguialarmas/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useSesion } from "@/lib/sesion";
import { DialogoCliente } from "./DialogoCliente";

/** WA-05: clientes finales de Aguialarmas. */
export function PaginaClientes() {
  const navegar = useNavigate();
  const queryClient = useQueryClient();
  const puedeGestionar = puede(useSesion((s) => s.usuario?.rol), "clientes.gestionar");
  const [buscar, setBuscar] = useState("");
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const filtro = { buscar: useDeferredValue(buscar.trim()), incluirInactivos };
  const clientes = useQuery({ queryKey: ["clientes", filtro], queryFn: () => api.clientes(filtro) });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Clientes</h1>
          <p className="text-muted-foreground">Clientes finales y sus cuentas (sedes).</p>
        </div>
        {puedeGestionar && (
          <Button onClick={() => setNuevo(true)}>
            <Plus data-icon="inline-start" /> Nuevo cliente
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar por nombre o NIT" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={incluirInactivos} onCheckedChange={(v) => setIncluirInactivos(v === true)} />
          Mostrar inactivos
        </label>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          {clientes.isPending ? (
            <div className="grid gap-2 p-4">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : clientes.isError ? (
            <p className="p-4 text-sm text-destructive">{clientes.error.message}</p>
          ) : clientes.data.length === 0 ? (
            <div className="grid justify-items-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <Building2 className="size-6" />
              {filtro.buscar ? `Ningún cliente coincide con "${filtro.buscar}".` : "Aún no hay clientes."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Cliente</TableHead>
                  <TableHead>NIT o cédula</TableHead>
                  <TableHead>Cuentas activas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.data.map((c) => (
                  <TableRow key={c.id} className={`cursor-pointer ${c.activo ? "" : "text-muted-foreground"}`} onClick={() => navegar(`/clientes/${c.id}`)}>
                    <TableCell className="pl-4 font-semibold">{c.nombre}</TableCell>
                    <TableCell>{c.identificacion ?? "—"}</TableCell>
                    <TableCell>{c.cuentasActivas}</TableCell>
                    <TableCell>{c.activo ? <Badge variant="exito">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DialogoCliente
        abierto={nuevo}
        cliente={null}
        onCerrar={() => setNuevo(false)}
        onGuardado={(c) => {
          void queryClient.invalidateQueries({ queryKey: ["clientes"] });
          navegar(`/clientes/${c.id}`);
        }}
      />
    </div>
  );
}
