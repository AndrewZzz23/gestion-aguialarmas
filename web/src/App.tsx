import { useQuery } from "@tanstack/react-query";
import { NavLink, Route, Routes } from "react-router";
import { Marca } from "@/components/marca/Marca";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuiaEstilos } from "@/modulos/estilos/GuiaEstilos";
import { PaginaRutas } from "@/modulos/rutas/PaginaRutas";
import { api } from "./lib/api";

function Inicio() {
  const estado = useQuery({ queryKey: ["estado"], queryFn: api.estado });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Web administrativa</CardTitle>
      </CardHeader>
      <CardContent>
        {estado.isPending && <p className="text-muted-foreground">Conectando con la API…</p>}
        {estado.isError && (
          <Alert variant="aviso">
            <AlertTitle>No hay conexión con la API</AlertTitle>
            <AlertDescription>¿Está corriendo en http://localhost:5080?</AlertDescription>
          </Alert>
        )}
        {estado.data && (
          <p>
            Conectado a <b>{estado.data.sistema}</b> · v{estado.data.version}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EnlaceBarra({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        isActive
          ? "border-b-2 border-marca-amarillo pb-1 text-white"
          : "border-b-2 border-transparent pb-1 text-white/70 hover:text-white"
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-svh">
      <header className="flex items-center gap-8 bg-marca-negro px-6 py-3 text-white">
        <Marca />
        <nav className="flex gap-6 text-sm font-medium">
          <EnlaceBarra to="/">Inicio</EnlaceBarra>
          <EnlaceBarra to="/rutas">Rutas</EnlaceBarra>
          <EnlaceBarra to="/estilos">Estilos</EnlaceBarra>
        </nav>
      </header>
      <main className="mx-auto max-w-[96rem] p-6">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/rutas" element={<PaginaRutas />} />
          <Route path="/estilos" element={<GuiaEstilos />} />
        </Routes>
      </main>
    </div>
  );
}
