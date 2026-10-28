using Aguialarmas.Api.Seguridad;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Rutas;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Api.Endpoints;

/// <summary>Anillo exterior del polígono como pares [longitud, latitud], igual que GeoJSON.</summary>
public sealed record RutaDto(Guid Id, string Nombre, string Color, double[][] Area);

public sealed record GuardarRutaDto(string Nombre, string Color, double[][] Area);

/// <summary>Rutas de la ciudad dibujadas en el mapa (WA-28).</summary>
public static class RutasEndpoints
{
    private static readonly GeometryFactory Fabrica = new(new PrecisionModel(), 4326);

    public static void MapRutas(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/rutas").WithTags("Rutas").RequireAuthorization(Permisos.VerRutas);

        grupo.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var rutas = await db.Rutas.Where(r => r.Activo).OrderBy(r => r.Nombre).ToListAsync(ct);
            return rutas.Select(ADto);
        });

        grupo.MapPost("/", async (GuardarRutaDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var ruta = new Ruta(datos.Nombre, datos.Color, APoligono(datos.Area));
            await ValidarQueNoSeCruce(db, ruta, ct);
            db.Rutas.Add(ruta);
            await ReasignarCuentas(db, ruta, ct);
            await db.SaveChangesAsync(ct);
            return Results.Created($"/api/rutas/{ruta.Id}", ADto(ruta));
        }).RequireAuthorization(Permisos.GestionarRutas);

        grupo.MapPut("/{id:guid}", async (Guid id, GuardarRutaDto datos, AppDbContext db, CancellationToken ct) =>
        {
            var ruta = await db.Rutas.FirstOrDefaultAsync(r => r.Id == id && r.Activo, ct);
            if (ruta is null)
            {
                return Results.NotFound();
            }

            ruta.CambiarDatos(datos.Nombre, datos.Color);
            ruta.CambiarArea(APoligono(datos.Area));
            await ValidarQueNoSeCruce(db, ruta, ct);
            await ReasignarCuentas(db, ruta, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(ADto(ruta));
        }).RequireAuthorization(Permisos.GestionarRutas);

        // No hay DELETE: en este sistema nada se borra, se inactiva.
        grupo.MapPost("/{id:guid}/inactivar", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var ruta = await db.Rutas.FirstOrDefaultAsync(r => r.Id == id && r.Activo, ct);
            if (ruta is null)
            {
                return Results.NotFound();
            }

            ruta.Inactivar();
            await db.Cuentas.Where(c => c.RutaId == id).ForEachAsync(c => c.AsignarRuta(null), ct);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        }).RequireAuthorization(Permisos.GestionarRutas);
    }

    private static RutaDto ADto(Ruta r) =>
        new(r.Id, r.Nombre, r.Color, r.Area.ExteriorRing.Coordinates.Select(c => new[] { c.X, c.Y }).ToArray());

    private static Polygon APoligono(double[][]? anillo)
    {
        if (anillo is null || anillo.Any(p => p is null || p.Length != 2))
        {
            throw new ExcepcionDominio("El área de la ruta debe ser una lista de puntos [longitud, latitud].");
        }

        var puntos = anillo.Select(p => new Coordinate(p[0], p[1])).ToList();
        if (puntos.Count > 0 && !puntos[0].Equals2D(puntos[^1]))
        {
            puntos.Add(puntos[0].Copy());
        }

        if (puntos.Count < 4)
        {
            throw new ExcepcionDominio("La ruta necesita al menos 3 puntos.");
        }

        return Fabrica.CreatePolygon(puntos.ToArray());
    }

    private static async Task ValidarQueNoSeCruce(AppDbContext db, Ruta ruta, CancellationToken ct)
    {
        // Pocas rutas por ciudad: se valida en memoria con NetTopologySuite.
        var otras = await db.Rutas.Where(r => r.Activo && r.Id != ruta.Id).ToListAsync(ct);
        var cruce = otras.FirstOrDefault(ruta.SeCruzaCon);
        if (cruce is not null)
        {
            throw new ExcepcionDominio($"La ruta se cruza con \"{cruce.Nombre}\". Ajusta el borde para que no compartan área.");
        }
    }

    /// <summary>Cada cuenta queda en la ruta que contiene su ubicación (WA-28).</summary>
    private static async Task ReasignarCuentas(AppDbContext db, Ruta ruta, CancellationToken ct)
    {
        var cuentas = await db.Cuentas
            .Where(c => c.Activo && c.Ubicacion != null && (c.RutaId == null || c.RutaId == ruta.Id))
            .ToListAsync(ct);

        foreach (var cuenta in cuentas)
        {
            var dentro = ruta.Contiene(cuenta.Ubicacion!);
            if (dentro && cuenta.RutaId != ruta.Id)
            {
                cuenta.AsignarRuta(ruta.Id);
            }
            else if (!dentro && cuenta.RutaId == ruta.Id)
            {
                cuenta.AsignarRuta(null);
            }
        }
    }
}
