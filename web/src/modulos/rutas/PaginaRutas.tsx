import { coloresRutas, GuardarRuta, type Punto, type Ruta } from "@aguialarmas/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MapPinned, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { MapaRutas, type Borrador } from "./MapaRutas";

type Modo =
  | { tipo: "ver" }
  | { tipo: "dibujar" }
  | { tipo: "formulario"; id: string | null; clave: string; nombre: string; color: string; area: Punto[] };

const claveRutas = ["rutas"];

/** WA-28: rutas de la ciudad dibujadas en el mapa. */
export function PaginaRutas() {
  const queryClient = useQueryClient();
  const rutas = useQuery({ queryKey: claveRutas, queryFn: api.rutas });
  const [modo, setModo] = useState<Modo>({ tipo: "ver" });
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [porInactivar, setPorInactivar] = useState<Ruta | null>(null);

  const lista = rutas.data ?? [];
  const seleccionada = lista.find((r) => r.id === seleccionadaId) ?? null;

  const guardar = useMutation({
    mutationFn: ({ id, datos }: { id: string | null; datos: GuardarRuta }) =>
      id ? api.actualizarRuta(id, datos) : api.crearRuta(datos),
    onSuccess: (ruta, { id }) => {
      toast.success(id ? `Ruta "${ruta.nombre}" actualizada` : `Ruta "${ruta.nombre}" creada`);
      setModo({ tipo: "ver" });
      setSeleccionadaId(ruta.id);
      return queryClient.invalidateQueries({ queryKey: claveRutas });
    },
    onError: (error) => toast.error(error.message),
  });

  const inactivar = useMutation({
    mutationFn: (ruta: Ruta) => api.inactivarRuta(ruta.id),
    onSuccess: (_, ruta) => {
      toast.success(`Ruta "${ruta.nombre}" inactivada`);
      setPorInactivar(null);
      setSeleccionadaId(null);
      return queryClient.invalidateQueries({ queryKey: claveRutas });
    },
    onError: (error) => toast.error(error.message),
  });

  function siguienteColor() {
    const usados = new Set(lista.map((r) => r.color.toUpperCase()));
    return coloresRutas.find((c) => !usados.has(c)) ?? coloresRutas[lista.length % coloresRutas.length];
  }

  function editar(ruta: Ruta) {
    setSeleccionadaId(ruta.id);
    setModo({ tipo: "formulario", id: ruta.id, clave: ruta.id, nombre: ruta.nombre, color: ruta.color, area: ruta.area });
  }

  function enviarFormulario(evento: React.FormEvent) {
    evento.preventDefault();
    if (modo.tipo !== "formulario") return;
    const datos = GuardarRuta.safeParse({ nombre: modo.nombre, color: modo.color, area: modo.area });
    if (!datos.success) {
      toast.error(datos.error.issues[0].message);
      return;
    }
    guardar.mutate({ id: modo.id, datos: datos.data });
  }

  const borrador: Borrador | null =
    modo.tipo === "formulario" ? { clave: modo.clave, area: modo.area, color: modo.color } : null;

  return (
    <div className="grid gap-4 lg:h-[calc(100svh-7.5rem)] lg:grid-cols-[22rem_1fr]">
      <Card className="lg:overflow-y-auto">
        {modo.tipo === "ver" && (
          <>
            <CardHeader>
              <CardTitle>Rutas de la ciudad</CardTitle>
              <CardDescription>Áreas de Ibagué que agrupan las cuentas. Cada cuenta queda en la ruta que contiene su ubicación.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button onClick={() => { setSeleccionadaId(null); setModo({ tipo: "dibujar" }); }}>
                <Plus data-icon="inline-start" /> Nueva ruta
              </Button>

              {rutas.isPending && <Skeleton className="h-24" />}
              {rutas.isError && <p className="text-sm text-destructive">{rutas.error.message}</p>}
              {rutas.isSuccess && lista.length === 0 && (
                <div className="grid justify-items-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  <MapPinned className="size-6" />
                  Aún no hay rutas. Dibuja la primera.
                </div>
              )}

              <ul className="grid gap-1">
                {lista.map((ruta) => (
                  <li key={ruta.id}>
                    <button
                      type="button"
                      onClick={() => setSeleccionadaId(ruta.id === seleccionadaId ? null : ruta.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted aria-pressed:bg-accent"
                      aria-pressed={ruta.id === seleccionadaId}
                    >
                      <span className="size-4 shrink-0 rounded-sm border" style={{ backgroundColor: ruta.color }} />
                      <span className="flex-1 font-semibold">{ruta.nombre}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {seleccionada && (
                <div className="flex gap-2 border-t pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => editar(seleccionada)}>
                    <Pencil data-icon="inline-start" /> Editar
                  </Button>
                  <Button variant="destructive" onClick={() => setPorInactivar(seleccionada)}>
                    Inactivar
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        )}

        {modo.tipo === "dibujar" && (
          <>
            <CardHeader>
              <CardTitle>Dibuja la ruta</CardTitle>
              <CardDescription>Haz clic en el mapa para marcar cada esquina. Termina haciendo clic sobre el primer punto.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>Los bordes se pegan a los de las rutas vecinas para que no queden huecos ni cruces.</p>
              <Button variant="outline" onClick={() => setModo({ tipo: "ver" })}>
                Cancelar
              </Button>
            </CardContent>
          </>
        )}

        {modo.tipo === "formulario" && (
          <>
            <CardHeader>
              <CardTitle>{modo.id ? "Editar ruta" : "Nueva ruta"}</CardTitle>
              <CardDescription>Arrastra los puntos del borde en el mapa para ajustar la forma.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={enviarFormulario}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="nombre-ruta">Nombre</FieldLabel>
                    <Input
                      id="nombre-ruta"
                      autoFocus
                      placeholder="Ej.: Centro"
                      value={modo.nombre}
                      onChange={(e) => setModo({ ...modo, nombre: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Color</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {coloresRutas.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Color ${c}`}
                          onClick={() => setModo({ ...modo, color: c })}
                          className="grid size-8 place-items-center rounded-md border ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-ring"
                          aria-pressed={modo.color.toUpperCase() === c}
                          style={{ backgroundColor: c }}
                        >
                          {modo.color.toUpperCase() === c && <Check className="size-4 text-white mix-blend-difference" />}
                        </button>
                      ))}
                    </div>
                    <FieldDescription>Así se distingue la ruta en el mapa y en el tablero.</FieldDescription>
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={guardar.isPending}>
                      {guardar.isPending ? "Guardando…" : "Guardar ruta"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setModo({ tipo: "ver" })}>
                      Cancelar
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      <div className="relative z-0 h-[60svh] overflow-hidden rounded-xl border lg:h-auto">
        <MapaRutas
          rutas={lista}
          seleccionadaId={seleccionadaId}
          ocultarId={modo.tipo === "formulario" ? modo.id : null}
          dibujando={modo.tipo === "dibujar"}
          borrador={borrador}
          onSeleccionar={(id) => modo.tipo === "ver" && setSeleccionadaId(id)}
          onDibujada={(area) =>
            setModo({ tipo: "formulario", id: null, clave: crypto.randomUUID(), nombre: "", color: siguienteColor(), area })
          }
          onBorradorCambiado={(area) => setModo((m) => (m.tipo === "formulario" ? { ...m, area } : m))}
        />
      </div>

      <Dialog open={porInactivar !== null} onOpenChange={(abierto) => !abierto && setPorInactivar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Inactivar la ruta "{porInactivar?.nombre}"?</DialogTitle>
            <DialogDescription>
              La ruta no se borra: queda inactiva y el cambio se registra en la auditoría. Las cuentas que estaban en ella quedan sin ruta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" disabled={inactivar.isPending} onClick={() => porInactivar && inactivar.mutate(porInactivar)}>
              Inactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
