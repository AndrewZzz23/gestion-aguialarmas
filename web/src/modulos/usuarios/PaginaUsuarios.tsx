import { GuardarUsuario, nombresRol, Rol, type Usuario } from "@aguialarmas/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useSesion } from "@/lib/sesion";

const claveUsuarios = ["usuarios"];

type Formulario = { id: string | null } & GuardarUsuario;

function EstadoUsuario({ usuario }: { usuario: Usuario }) {
  if (!usuario.activo) return <Badge variant="outline">Inactivo</Badge>;
  if (usuario.bloqueado) return <Badge variant="destructive">Bloqueado</Badge>;
  if (!usuario.contrasenaDefinida) return <Badge variant="aviso">Pendiente de activar</Badge>;
  return <Badge variant="exito">Activo</Badge>;
}

/** WA-02: usuarios y roles. Solo el Administrador. */
export function PaginaUsuarios() {
  const queryClient = useQueryClient();
  const yo = useSesion((s) => s.usuario);
  const usuarios = useQuery({ queryKey: claveUsuarios, queryFn: api.usuarios });
  const [formulario, setFormulario] = useState<Formulario | null>(null);

  const refrescar = () => queryClient.invalidateQueries({ queryKey: claveUsuarios });

  const guardar = useMutation({
    mutationFn: ({ id, ...datos }: Formulario) => (id ? api.actualizarUsuario(id, datos) : api.crearUsuario(datos)),
    onSuccess: (usuario, { id }) => {
      toast.success(id ? `${usuario.nombre} actualizado` : `Se envió un correo a ${usuario.correo} para que cree su contraseña`);
      setFormulario(null);
      return refrescar();
    },
    onError: (e) => toast.error(e.message),
  });

  const accion = useMutation({
    mutationFn: ({ tipo, usuario }: { tipo: "inactivar" | "reactivar" | "reenviar"; usuario: Usuario }) =>
      tipo === "inactivar"
        ? api.inactivarUsuario(usuario.id)
        : tipo === "reactivar"
          ? api.reactivarUsuario(usuario.id)
          : api.reenviarAcceso(usuario.id),
    onSuccess: (_, { tipo, usuario }) => {
      toast.success(
        tipo === "inactivar"
          ? `${usuario.nombre} inactivado. Se cerraron sus sesiones.`
          : tipo === "reactivar"
            ? `${usuario.nombre} reactivado`
            : `Se envió un enlace de acceso a ${usuario.correo}`,
      );
      return refrescar();
    },
    onError: (e) => toast.error(e.message),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!formulario) return;
    const datos = GuardarUsuario.safeParse(formulario);
    if (!datos.success) return toast.error(datos.error.issues[0].message);
    guardar.mutate({ id: formulario.id, ...datos.data });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Usuarios</h1>
          <p className="text-muted-foreground">Personas que entran a la web y a la app, con su rol.</p>
        </div>
        <Button onClick={() => setFormulario({ id: null, nombre: "", correo: "", rol: "Tecnico" })}>
          <Plus data-icon="inline-start" /> Nuevo usuario
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          {usuarios.isPending ? (
            <div className="grid gap-2 p-4">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : usuarios.isError ? (
            <p className="p-4 text-sm text-destructive">{usuarios.error.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.data.map((u) => (
                  <TableRow key={u.id} className={u.activo ? "" : "text-muted-foreground"}>
                    <TableCell className="pl-4 font-semibold">
                      {u.nombre} {u.id === yo?.id && <span className="text-xs font-normal text-muted-foreground">(tú)</span>}
                    </TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>{nombresRol[u.rol]}</TableCell>
                    <TableCell>
                      <EstadoUsuario usuario={u} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${u.nombre}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setFormulario({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol })}>
                            Editar
                          </DropdownMenuItem>
                          {u.activo && (
                            <DropdownMenuItem onSelect={() => accion.mutate({ tipo: "reenviar", usuario: u })}>
                              {u.contrasenaDefinida ? "Enviar enlace para cambiar contraseña" : "Reenviar correo de activación"}
                            </DropdownMenuItem>
                          )}
                          {u.id !== yo?.id && (
                            <>
                              <DropdownMenuSeparator />
                              {u.activo ? (
                                <DropdownMenuItem variant="destructive" onSelect={() => accion.mutate({ tipo: "inactivar", usuario: u })}>
                                  Inactivar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={() => accion.mutate({ tipo: "reactivar", usuario: u })}>Reactivar</DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formulario !== null} onOpenChange={(abierto) => !abierto && setFormulario(null)}>
        <DialogContent>
          {formulario && (
            <form onSubmit={enviar} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>{formulario.id ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                <DialogDescription>
                  {formulario.id
                    ? "Los cambios quedan en la auditoría."
                    : "Le llegará un correo para que cree su propia contraseña. Tú nunca la conoces."}
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
                  <Input id="nombre" autoFocus value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="correo">Correo</FieldLabel>
                  <Input id="correo" type="email" value={formulario.correo} onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })} />
                  <FieldDescription>Es el usuario para entrar a la web y a la app.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="rol">Rol</FieldLabel>
                  <Select value={formulario.rol} onValueChange={(rol) => setFormulario({ ...formulario, rol: rol as Rol })}>
                    <SelectTrigger id="rol" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Rol.options.map((r) => (
                        <SelectItem key={r} value={r}>
                          {nombresRol[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormulario(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardar.isPending}>
                  {guardar.isPending ? "Guardando…" : formulario.id ? "Guardar" : "Crear y enviar correo"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
