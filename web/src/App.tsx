import { nombresRol, puede, type Permiso } from "@aguialarmas/shared";
import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router";
import { Marca } from "@/components/marca/Marca";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginaIngresar } from "@/modulos/autenticacion/PaginaIngresar";
import { PaginaRecuperar } from "@/modulos/autenticacion/PaginaRecuperar";
import { PaginaRestablecer } from "@/modulos/autenticacion/PaginaRestablecer";
import { GuiaEstilos } from "@/modulos/estilos/GuiaEstilos";
import { PaginaRutas } from "@/modulos/rutas/PaginaRutas";
import { PaginaUsuarios } from "@/modulos/usuarios/PaginaUsuarios";
import { cerrarSesion, useSesion } from "@/lib/sesion";
import { api } from "./lib/api";

function Inicio() {
  const usuario = useSesion((s) => s.usuario)!;
  const estado = useQuery({ queryKey: ["estado"], queryFn: api.estado });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Hola, {usuario.nombre.split(" ")[0]}</CardTitle>
      </CardHeader>
      <CardContent>
        {estado.isError && (
          <Alert variant="aviso">
            <AlertTitle>No hay conexión con la API</AlertTitle>
            <AlertDescription>¿Está corriendo en http://localhost:5080?</AlertDescription>
          </Alert>
        )}
        {estado.data && (
          <p className="text-muted-foreground">
            Conectado a {estado.data.sistema} · v{estado.data.version}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Menú principal. Cada enlace aparece solo si el rol tiene el permiso (WA-03). */
const menu: { a: string; texto: string; permiso?: Permiso }[] = [
  { a: "/", texto: "Inicio" },
  { a: "/rutas", texto: "Rutas", permiso: "rutas.ver" },
  { a: "/usuarios", texto: "Usuarios", permiso: "usuarios.gestionar" },
  { a: "/estilos", texto: "Estilos" },
];

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

function MenuUsuario() {
  const usuario = useSesion((s) => s.usuario)!;
  const iniciales = usuario.nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto h-auto gap-3 py-1.5 text-white hover:bg-white/10 hover:text-white">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-semibold">{usuario.nombre}</span>
            <span className="block text-xs text-white/60">{nombresRol[usuario.rol]}</span>
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-marca-amarillo text-xs font-bold text-marca-negro">{iniciales}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid">
          <span>{usuario.nombre}</span>
          <span className="text-xs font-normal text-muted-foreground">{usuario.correo}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => cerrarSesion()}>
          <LogOut /> Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Marco de las pantallas con sesión: barra superior y contenido. Sin sesión, manda a /ingresar. */
function ConSesion() {
  const usuario = useSesion((s) => s.usuario);
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname }} />;

  return (
    <div className="min-h-svh">
      <header className="flex items-center gap-8 bg-marca-negro px-6 py-2 text-white">
        <Marca />
        <nav className="flex gap-6 text-sm font-medium">
          {menu
            .filter((m) => !m.permiso || puede(usuario.rol, m.permiso))
            .map((m) => (
              <EnlaceBarra key={m.a} to={m.a}>
                {m.texto}
              </EnlaceBarra>
            ))}
        </nav>
        <MenuUsuario />
      </header>
      <main className="mx-auto max-w-[96rem] p-6">
        <Outlet />
      </main>
    </div>
  );
}

/** Si el rol no tiene el permiso, vuelve al inicio. La API igual lo rechazaría (403). */
function ConPermiso({ permiso, children }: { permiso: Permiso; children: React.ReactNode }) {
  const rol = useSesion((s) => s.usuario?.rol);
  return puede(rol, permiso) ? children : <Navigate to="/" replace />;
}

export default function App() {
  const restaurando = useSesion((s) => s.restaurando);
  if (restaurando) {
    return (
      <div className="grid min-h-svh place-items-center">
        <img src="/aguila.png" alt="Cargando" className="size-16 animate-pulse" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/ingresar" element={<PaginaIngresar />} />
      <Route path="/recuperar" element={<PaginaRecuperar />} />
      <Route path="/restablecer" element={<PaginaRestablecer />} />
      <Route element={<ConSesion />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/rutas" element={<ConPermiso permiso="rutas.ver"><PaginaRutas /></ConPermiso>} />
        <Route path="/usuarios" element={<ConPermiso permiso="usuarios.gestionar"><PaginaUsuarios /></ConPermiso>} />
        <Route path="/estilos" element={<GuiaEstilos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
