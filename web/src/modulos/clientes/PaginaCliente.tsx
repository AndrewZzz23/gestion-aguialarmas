import { GuardarCuenta, puede, type Cuenta, type Punto, type Ruta } from "@aguialarmas/shared";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MapPinOff, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSesion } from "@/lib/sesion";
import { DialogoCliente } from "./DialogoCliente";
import { MapaCuentas } from "./MapaCuentas";

type FormularioCuenta = {
  id: string | null;
  nombre: string;
  direccion: string;
  contacto: string;
  correoContacto: string;
  ubicacion: Punto | null;
  radioLlegadaM: string;
};

const vacio: FormularioCuenta = { id: null, nombre: "", direccion: "", contacto: "", correoContacto: "", ubicacion: null, radioLlegadaM: "100" };

/** Vista previa de la ruta que le tocará; la API la vuelve a calcular al guardar. */
function rutaDe(punto: Punto | null, rutas: Ruta[]): Ruta | null {
  if (!punto) return null;
  return rutas.find((r) => r.area.length >= 3 && booleanPointInPolygon(point(punto), polygon([[...r.area, r.area[0]]]))) ?? null;
}

function InsigniaRuta({ nombre, rutas }: { nombre: string | null; rutas: Ruta[] }) {
  if (!nombre) return <Badge variant="aviso">Sin ruta</Badge>;
  const color = rutas.find((r) => r.nombre === nombre)?.color;
  return (
    <Badge variant="outline">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} /> {nombre}
    </Badge>
  );
}

/** WA-05, WA-06: ficha del cliente con sus cuentas en el mapa. */
export function PaginaCliente() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const puedeGestionar = puede(useSesion((s) => s.usuario?.rol), "clientes.gestionar");
  const cliente = useQuery({ queryKey: ["cliente", id], queryFn: () => api.cliente(id) });
  const rutas = useQuery({ queryKey: ["rutas"], queryFn: api.rutas });
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioCuenta | null>(null);
  const [editandoCliente, setEditandoCliente] = useState(false);

  const refrescar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["cliente", id] }),
      queryClient.invalidateQueries({ queryKey: ["clientes"] }),
    ]);

  const guardarCuenta = useMutation({
    mutationFn: ({ idCuenta, datos }: { idCuenta: string | null; datos: GuardarCuenta }) =>
      idCuenta ? api.actualizarCuenta(idCuenta, datos) : api.crearCuenta(id, datos),
    onSuccess: (cuenta, { idCuenta }) => {
      toast.success(`${cuenta.nombre} ${idCuenta ? "actualizada" : "creada"}${cuenta.rutaNombre ? ` · ruta ${cuenta.rutaNombre}` : ""}`);
      setFormulario(null);
      setSeleccionadaId(cuenta.id);
      return refrescar();
    },
    onError: (e) => toast.error(e.message),
  });

  const cambiarEstado = useMutation({
    mutationFn: (accion: () => Promise<undefined>) => accion(),
    onSuccess: refrescar,
    onError: (e) => toast.error(e.message),
  });

  if (cliente.isPending) return <Skeleton className="h-96" />;
  if (cliente.isError) return <p className="text-destructive">{cliente.error.message}</p>;

  const c = cliente.data;
  const listaRutas = rutas.data ?? [];
  const seleccionada = c.cuentas.find((x) => x.id === seleccionadaId) ?? null;
  const radio = Number(formulario?.radioLlegadaM);
  const radioValido = Number.isInteger(radio) && radio >= 20 && radio <= 1000;

  function editarCuenta(cuenta: Cuenta) {
    setSeleccionadaId(cuenta.id);
    setFormulario({
      id: cuenta.id,
      nombre: cuenta.nombre,
      direccion: cuenta.direccion,
      contacto: cuenta.contacto ?? "",
      correoContacto: cuenta.correoContacto ?? "",
      ubicacion: cuenta.ubicacion,
      radioLlegadaM: String(cuenta.radioLlegadaM),
    });
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!formulario) return;
    const datos = GuardarCuenta.safeParse({
      nombre: formulario.nombre,
      direccion: formulario.direccion,
      contacto: formulario.contacto.trim() || null,
      correoContacto: formulario.correoContacto.trim() || null,
      ubicacion: formulario.ubicacion,
      radioLlegadaM: radio,
    });
    if (!datos.success) return toast.error(datos.error.issues[0].message);
    guardarCuenta.mutate({ idCuenta: formulario.id, datos: datos.data });
  }

  const rutaPrevia = rutaDe(formulario?.ubicacion ?? null, listaRutas);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button variant="ghost" size="icon" asChild aria-label="Volver a clientes">
          <Link to="/clientes">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="mr-auto">
          <h1 className="flex items-center gap-3 text-2xl">
            {c.nombre} {!c.activo && <Badge variant="outline">Inactivo</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">{c.identificacion ? `NIT / CC ${c.identificacion}` : "Sin identificación"}</p>
        </div>
        {puedeGestionar && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditandoCliente(true)}>
              <Pencil data-icon="inline-start" /> Editar
            </Button>
            {c.activo ? (
              <Button variant="destructive" onClick={() => cambiarEstado.mutate(() => api.inactivarCliente(c.id))}>
                Inactivar
              </Button>
            ) : (
              <Button variant="outline" onClick={() => cambiarEstado.mutate(() => api.reactivarCliente(c.id))}>
                Reactivar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:h-[calc(100svh-12.5rem)] lg:grid-cols-[24rem_1fr]">
        <Card className="lg:overflow-y-auto">
          {formulario === null ? (
            <>
              <CardHeader>
                <CardTitle>Cuentas</CardTitle>
                <CardDescription>Sedes del cliente. Cada una queda en la ruta donde está ubicada.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {puedeGestionar && c.activo && (
                  <Button
                    onClick={() => {
                      setSeleccionadaId(null);
                      setFormulario(vacio);
                    }}
                  >
                    <Plus data-icon="inline-start" /> Nueva cuenta
                  </Button>
                )}
                {c.cuentas.length === 0 && (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Este cliente aún no tiene cuentas.</p>
                )}
                <ul className="grid gap-1">
                  {c.cuentas.map((cuenta) => (
                    <li key={cuenta.id}>
                      <button
                        type="button"
                        aria-pressed={cuenta.id === seleccionadaId}
                        onClick={() => setSeleccionadaId(cuenta.id === seleccionadaId ? null : cuenta.id)}
                        className={`grid w-full gap-1 rounded-lg px-3 py-2 text-left hover:bg-muted aria-pressed:bg-accent ${cuenta.activo ? "" : "opacity-60"}`}
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          {cuenta.ubicacion ? <MapPin className="size-4" /> : <MapPinOff className="size-4 text-aviso" />}
                          {cuenta.nombre}
                        </span>
                        <span className="text-xs text-muted-foreground">{cuenta.direccion}</span>
                        <span className="flex flex-wrap gap-1">
                          <InsigniaRuta nombre={cuenta.rutaNombre} rutas={listaRutas} />
                          {!cuenta.ubicacion && <Badge variant="aviso">Sin ubicación</Badge>}
                          {!cuenta.activo && <Badge variant="outline">Inactiva</Badge>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {seleccionada && (
                  <div className="grid gap-3 border-t pt-4 text-sm">
                    <div className="grid gap-0.5">
                      <span className="text-muted-foreground">Contacto</span>
                      <span>{seleccionada.contacto ?? "—"}</span>
                      <span>{seleccionada.correoContacto ?? "Sin correo: no recibirá avisos de programación"}</span>
                    </div>
                    <span className="text-muted-foreground">Perímetro de llegada: {seleccionada.radioLlegadaM} m</span>
                    {puedeGestionar && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => editarCuenta(seleccionada)}>
                          <Pencil data-icon="inline-start" /> Editar
                        </Button>
                        {seleccionada.activo ? (
                          <Button variant="destructive" onClick={() => cambiarEstado.mutate(() => api.inactivarCuenta(seleccionada.id))}>
                            Inactivar
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => cambiarEstado.mutate(() => api.reactivarCuenta(seleccionada.id))}>
                            Reactivar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>{formulario.id ? "Editar cuenta" : "Nueva cuenta"}</CardTitle>
                <CardDescription>Haz clic en el mapa para ubicar la sede; puedes arrastrar el pin para afinar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={enviar}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="nombre-cuenta">Nombre</FieldLabel>
                      <Input id="nombre-cuenta" autoFocus placeholder="Ej.: Sede Calle 60" value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
                      <Input id="direccion" placeholder="Ej.: Cra 5 # 60-12, Ibagué" value={formulario.direccion} onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="contacto">Contacto</FieldLabel>
                      <Input id="contacto" placeholder="Nombre de la persona" value={formulario.contacto} onChange={(e) => setFormulario({ ...formulario, contacto: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="correo-contacto">Correo del contacto</FieldLabel>
                      <Input id="correo-contacto" type="email" value={formulario.correoContacto} onChange={(e) => setFormulario({ ...formulario, correoContacto: e.target.value })} />
                      <FieldDescription>Recibe los avisos de programación y de "voy en camino".</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="radio">Perímetro de llegada (metros)</FieldLabel>
                      <Input id="radio" type="number" min={20} max={1000} step={10} value={formulario.radioLlegadaM} onChange={(e) => setFormulario({ ...formulario, radioLlegadaM: e.target.value })} />
                      <FieldDescription>Si el técnico marca la llegada más lejos, queda la alerta de fuera de perímetro.</FieldDescription>
                    </Field>
                    <div className="grid gap-1 rounded-lg bg-muted p-3 text-sm">
                      {formulario.ubicacion ? (
                        <>
                          <span className="flex items-center gap-2 font-semibold">
                            <MapPin className="size-4" /> Ubicada
                          </span>
                          <span className="text-muted-foreground">
                            {rutaPrevia ? `Quedará en la ruta ${rutaPrevia.nombre}.` : "Queda fuera de todas las rutas."}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2 text-aviso">
                          <MapPinOff className="size-4" /> Falta ubicarla en el mapa
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={guardarCuenta.isPending}>
                        {guardarCuenta.isPending ? "Guardando…" : "Guardar cuenta"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setFormulario(null)}>
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
          <MapaCuentas
            rutas={listaRutas}
            cuentas={c.cuentas}
            seleccionadaId={seleccionadaId}
            ocultarId={formulario?.id ?? null}
            editable={formulario ? { punto: formulario.ubicacion, radioM: radioValido ? radio : 100 } : null}
            onSeleccionar={(cuentaId) => !formulario && setSeleccionadaId(cuentaId)}
            onUbicar={(punto) => setFormulario((f) => (f ? { ...f, ubicacion: punto } : f))}
          />
        </div>
      </div>

      <DialogoCliente
        abierto={editandoCliente}
        cliente={c}
        onCerrar={() => setEditandoCliente(false)}
        onGuardado={() => {
          setEditandoCliente(false);
          void refrescar();
        }}
      />
    </div>
  );
}
