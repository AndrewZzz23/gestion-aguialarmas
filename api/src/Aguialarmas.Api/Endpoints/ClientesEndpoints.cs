using Aguialarmas.Api.Seguridad;
using Aguialarmas.Domain.Clientes;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Api.Endpoints;

public sealed record ClienteResumenDto(Guid Id, string Nombre, string? Identificacion, bool Activo, int CuentasActivas);

public sealed record ClienteDto(Guid Id, string Nombre, string? Identificacion, bool Activo, CuentaDto[] Cuentas);

public sealed record GuardarClienteDto(string Nombre, string? Identificacion);

/// <summary>Ubicación como [longitud, latitud], igual que GeoJSON y las rutas.</summary>
public sealed record CuentaDto(
    Guid Id, Guid ClienteId, string Nombre, string Direccion, string? Contacto, string? CorreoContacto,
    double[]? Ubicacion, int RadioLlegadaM, Guid? RutaId, string? RutaNombre, bool Activo);

public sealed record GuardarCuentaDto(
    string Nombre, string Direccion, string? Contacto, string? CorreoContacto, double[]? Ubicacion, int? RadioLlegadaM);

/// <summary>Clientes (WA-05) y sus cuentas o sedes (WA-06).</summary>
public static class ClientesEndpoints
{
    public static void MapClientes(this IEndpointRouteBuilder app)
    {
        var clientes = app.MapGroup("/api/clientes").WithTags("Clientes").RequireAuthorization(Permisos.VerClientes);

        clientes.MapGet("/", async (string? buscar, bool? incluirInactivos, AppDbContext db, CancellationToken ct) =>
        {
            var consulta = db.Clientes.AsQueryable();
            if (incluirInactivos != true)
            {
                consulta = consulta.Where(c => c.Activo);
            }

            if (!string.IsNullOrWhiteSpace(buscar))
            {
                var texto = buscar.Trim();
                consulta = consulta.Where(c => c.Nombre.Contains(texto) || (c.Identificacion != null && c.Identificacion.Contains(texto)));
            }

            return await consulta
                .OrderByDescending(c => c.Activo).ThenBy(c => c.Nombre)
                .Select(c => new ClienteResumenDto(c.Id, c.Nombre, c.Identificacion, c.Activo, c.Cuentas.Count(x => x.Activo)))
                .ToListAsync(ct);
        });

        clientes.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == id, ct);
            return cliente is null ? Results.NotFound() : Results.Ok(await ADto(db, cliente, ct));
        });

        clientes.MapPost("/", async (GuardarClienteDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var cliente = new Cliente(datos.Nombre, datos.Identificacion);
            await ValidarIdentificacionUnica(db, cliente, ct);
            db.Clientes.Add(cliente);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/clientes/{cliente.Id}", await ADto(db, cliente, ct));
        }).RequireAuthorization(Permisos.GestionarClientes);

        clientes.MapPut("/{id:guid}", async (Guid id, GuardarClienteDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (cliente is null)
            {
                return Results.NotFound();
            }

            cliente.CambiarDatos(datos.Nombre, datos.Identificacion);
            await ValidarIdentificacionUnica(db, cliente, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(await ADto(db, cliente, ct));
        }).RequireAuthorization(Permisos.GestionarClientes);

        // Inactivar el cliente no toca sus cuentas: quedan como estaban, pero no se le pueden agregar nuevas.
        clientes.MapPost("/{id:guid}/inactivar", (Guid id, AppDbContext db, CancellationToken ct) =>
            CambiarActivo(db.Clientes, id, activo: false, db, ct)).RequireAuthorization(Permisos.GestionarClientes);

        clientes.MapPost("/{id:guid}/reactivar", (Guid id, AppDbContext db, CancellationToken ct) =>
            CambiarActivo(db.Clientes, id, activo: true, db, ct)).RequireAuthorization(Permisos.GestionarClientes);

        clientes.MapPost("/{id:guid}/cuentas", async (Guid id, GuardarCuentaDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (cliente is null)
            {
                return Results.NotFound();
            }

            if (!cliente.Activo)
            {
                throw new ExcepcionDominio("El cliente está inactivo: reactívalo antes de agregarle cuentas.");
            }

            var cuenta = new Cuenta(cliente.Id, datos.Nombre, datos.Direccion);
            await Aplicar(db, cuenta, datos, ct);
            db.Cuentas.Add(cuenta);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/cuentas/{cuenta.Id}", await CuentaADto(db, cuenta, ct));
        }).RequireAuthorization(Permisos.GestionarClientes);

        var cuentas = app.MapGroup("/api/cuentas").WithTags("Clientes").RequireAuthorization(Permisos.VerClientes);

        // Cuentas activas con ubicación, para pintarlas en los mapas.
        cuentas.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var lista = await db.Cuentas.Where(c => c.Activo).OrderBy(c => c.Nombre).ToListAsync(ct);
            var rutas = await NombresRutas(db, ct);
            return lista.Select(c => CuentaADto(c, rutas));
        });

        cuentas.MapPut("/{id:guid}", async (Guid id, GuardarCuentaDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var cuenta = await db.Cuentas.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (cuenta is null)
            {
                return Results.NotFound();
            }

            cuenta.CambiarDatos(datos.Nombre, datos.Direccion);
            await Aplicar(db, cuenta, datos, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(await CuentaADto(db, cuenta, ct));
        }).RequireAuthorization(Permisos.GestionarClientes);

        cuentas.MapPost("/{id:guid}/inactivar", (Guid id, AppDbContext db, CancellationToken ct) =>
            CambiarActivo(db.Cuentas, id, activo: false, db, ct)).RequireAuthorization(Permisos.GestionarClientes);

        cuentas.MapPost("/{id:guid}/reactivar", (Guid id, AppDbContext db, CancellationToken ct) =>
            CambiarActivo(db.Cuentas, id, activo: true, db, ct)).RequireAuthorization(Permisos.GestionarClientes);
    }

    /// <summary>Contacto, ubicación, perímetro y la ruta que corresponde a la ubicación (WA-28).</summary>
    private static async Task Aplicar(AppDbContext db, Cuenta cuenta, GuardarCuentaDto datos, CancellationToken ct)
    {
        cuenta.CambiarContacto(datos.Contacto, datos.CorreoContacto);
        if (datos.RadioLlegadaM is not null)
        {
            cuenta.CambiarRadioLlegada(datos.RadioLlegadaM.Value);
        }

        if (datos.Ubicacion is { Length: 2 } u)
        {
            cuenta.UbicarEn(latitud: u[1], longitud: u[0]);
        }
        else if (datos.Ubicacion is not null)
        {
            throw new ExcepcionDominio("La ubicación debe ser [longitud, latitud].");
        }

        if (cuenta.Ubicacion is not null)
        {
            var rutas = await db.Rutas.Where(r => r.Activo).ToListAsync(ct);
            cuenta.AsignarRuta(rutas.FirstOrDefault(r => r.Contiene(cuenta.Ubicacion))?.Id);
        }
    }

    private static async Task<IResult> CambiarActivo<T>(DbSet<T> conjunto, Guid id, bool activo, AppDbContext db, CancellationToken ct)
        where T : Entidad
    {
        var entidad = await conjunto.FirstOrDefaultAsync(e => e.Id == id && e.Activo != activo, ct);
        if (entidad is null)
        {
            return Results.NotFound();
        }

        if (activo)
        {
            entidad.Reactivar();
        }
        else
        {
            entidad.Inactivar();
        }

        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task ValidarIdentificacionUnica(AppDbContext db, Cliente cliente, CancellationToken ct)
    {
        if (cliente.Identificacion is not null
            && await db.Clientes.AnyAsync(c => c.Identificacion == cliente.Identificacion && c.Id != cliente.Id, ct))
        {
            throw new ExcepcionDominio($"Ya existe un cliente con la identificación {cliente.Identificacion}.");
        }
    }

    private static Task<Dictionary<Guid, string>> NombresRutas(AppDbContext db, CancellationToken ct) =>
        db.Rutas.Where(r => r.Activo).ToDictionaryAsync(r => r.Id, r => r.Nombre, ct);

    private static async Task<ClienteDto> ADto(AppDbContext db, Cliente cliente, CancellationToken ct)
    {
        var cuentas = await db.Cuentas.Where(c => c.ClienteId == cliente.Id)
            .OrderByDescending(c => c.Activo).ThenBy(c => c.Nombre).ToListAsync(ct);
        var rutas = await NombresRutas(db, ct);
        return new ClienteDto(cliente.Id, cliente.Nombre, cliente.Identificacion, cliente.Activo,
            cuentas.Select(c => CuentaADto(c, rutas)).ToArray());
    }

    private static async Task<CuentaDto> CuentaADto(AppDbContext db, Cuenta cuenta, CancellationToken ct) =>
        CuentaADto(cuenta, await NombresRutas(db, ct));

    private static CuentaDto CuentaADto(Cuenta c, Dictionary<Guid, string> rutas) => new(
        c.Id, c.ClienteId, c.Nombre, c.Direccion, c.Contacto, c.CorreoContacto,
        c.Ubicacion is Point p ? [p.X, p.Y] : null, c.RadioLlegadaM,
        c.RutaId, c.RutaId is Guid r && rutas.TryGetValue(r, out var nombre) ? nombre : null, c.Activo);
}
