import { coloresRutas, GuardarRuta, puede, type Punto, type Ruta } from "@aguialarmas/shared";
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
import { useSesion } from "@/lib/sesion";
import { MapaRutas, type Borrador } from "./MapaRutas";
import { recortarContraVecinas } from "./recortar";

type Modo =
  | { tipo: "ver" }
  | { tipo: "dibujar" }
  | { tipo: "formulario"; id: string | null; clave: string; nombre: string; color: string; area: Punto[] };

const claveRutas = ["rutas"];

/** WA-28: rutas de la ciudad dibujadas en el mapa. */
export function PaginaRutas() {
  const queryClient = useQueryClient();
  const rutas = useQuery({ queryKey: claveRutas, queryFn: api.rutas });
  const puedeGestionar = puede(useSesion((s) => s.usuario?.rol), "rutas.gestionar");
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

  /** Recorta la ruta contra sus vecinas y avisa qué pasó. Devuelve null si no se puede usar la forma. */
  function ajustarForma(area: Punto[], idPropio: string | null): { area: Punto[]; cambio: boolean } | null {
    const resultado = recortarContraVecinas(area, lista.filter((r) => r.id !== idPropio));
    const nombres = (vecinas: string[]) => vecinas.map((v) => `"${v}"`).join(" y ");

    switch (resultado.tipo) {
      case "igual":
        return { area, cambio: false };
      case "recortada":
        toast.info(`Se ajustó el borde para no pisar ${nombres(resultado.vecinas)}.`);
        if (resultado.partesDescartadas > 0) {
          toast.warning("La ruta atravesaba otra de lado a lado: se dejó solo la parte más grande.");
        }
        return { area: resultado.area, cambio: true };
      case "dentro":
        toast.warning(`La ruta queda completamente dentro de ${nombres(resultado.vecinas)}. Dibújala por fuera.`);
        return null;
      case "rodea":
        toast.warning(`La ruta encierra por completo a ${nombres(resultado.vecinas)}. Una ruta no puede rodear a otra.`);
        return null;
    }
  }

  function alDibujar(area: Punto[]) {
    const ajuste = ajustarForma(area, null);
    if (!ajuste) return; // Sigue en modo dibujo para intentarlo de nuevo.
    setModo({ tipo: "formulario", id: null, clave: crypto.randomUUID(), nombre: "", color: siguienteColor(), area: ajuste.area });
  }

  function alEditarForma(area: Punto[]) {
    if (modo.tipo !== "formulario") return;
    const ajuste = ajustarForma(area, modo.id);
    if (!ajuste) {
      // Se vuelve a la forma anterior; la clave nueva redibuja la capa editable.
      setModo({ ...modo, clave: crypto.randomUUID() });
      return;
    }
    setModo({ ...modo, area: ajuste.area, clave: ajuste.cambio ? crypto.randomUUID() : modo.clave });
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
              {puedeGestionar && (
                <Button onClick={() => { setSeleccionadaId(null); setModo({ tipo: "dibujar" }); }}>
                  <Plus data-icon="inline-start" /> Nueva ruta
                </Button>
              )}

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

              {seleccionada && puedeGestionar && (
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
          onDibujada={alDibujar}
          onBorradorCambiado={alEditarForma}
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
