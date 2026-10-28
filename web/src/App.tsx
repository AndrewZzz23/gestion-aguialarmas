import { useQuery } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import { api } from "./lib/api";

function Inicio() {
  const estado = useQuery({ queryKey: ["estado"], queryFn: api.estado });

  return (
    <section className="tarjeta">
      <h1>Web administrativa</h1>
      {estado.isPending && <p>Conectando con la API…</p>}
      {estado.isError && <p className="aviso">No hay conexión con la API. ¿Está corriendo en http://localhost:5080?</p>}
      {estado.data && (
        <p>
          Conectado a <b>{estado.data.sistema}</b> · v{estado.data.version}
        </p>
      )}
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="barra">
        <span className="az">AZ</span>
        <span className="marca">Gestión Aguialarmas</span>
      </header>
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
      </main>
    </div>
  );
}
