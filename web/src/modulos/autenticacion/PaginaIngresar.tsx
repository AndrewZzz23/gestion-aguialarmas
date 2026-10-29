import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { iniciarSesion, useSesion } from "@/lib/sesion";
import { MarcoAutenticacion } from "./MarcoAutenticacion";

/** WA-01: ingreso con correo y contraseña. */
export function PaginaIngresar() {
  const usuario = useSesion((s) => s.usuario);
  const destino = (useLocation().state as { desde?: string } | null)?.desde ?? "/";
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const ingresar = useMutation({
    mutationFn: () => api.ingresar(correo, contrasena),
    onSuccess: iniciarSesion,
  });

  if (usuario) return <Navigate to={destino} replace />;

  return (
    <MarcoAutenticacion titulo="Ingresar" descripcion="Usa el correo y la contraseña de tu cuenta.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ingresar.mutate();
        }}
      >
        <FieldGroup>
          {ingresar.isError && (
            <Alert variant="destructive">
              <AlertDescription>{ingresar.error.message}</AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="correo">Correo</FieldLabel>
            <Input id="correo" type="email" autoComplete="username" autoFocus required value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="contrasena">Contraseña</FieldLabel>
              <Link to="/recuperar" className="text-xs font-medium text-marca-amarillo-oscuro hover:underline">
                ¿La olvidaste?
              </Link>
            </div>
            <Input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" disabled={ingresar.isPending}>
            {ingresar.isPending ? "Ingresando…" : "Ingresar"}
          </Button>
        </FieldGroup>
      </form>
    </MarcoAutenticacion>
  );
}
