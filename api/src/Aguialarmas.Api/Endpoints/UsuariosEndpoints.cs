using System.Security.Claims;
using Aguialarmas.Api.Seguridad;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Seguridad;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace Aguialarmas.Api.Endpoints;

public sealed record GuardarUsuarioDto(string Nombre, string Correo, Rol Rol);

/// <summary>Gestión de usuarios (WA-02). Solo el Administrador.</summary>
public static class UsuariosEndpoints
{
    public static void MapUsuarios(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/usuarios").WithTags("Usuarios").RequireAuthorization(Permisos.GestionarUsuarios);

        grupo.MapGet("/", async (AppDbContext db, TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var usuarios = await db.Usuarios.OrderByDescending(u => u.Activo).ThenBy(u => u.Nombre).ToListAsync(ct);
            return usuarios.Select(u => UsuarioDto.De(u, ahora));
        });

        // El administrador no define la contraseña: le llega un enlace a la persona para que la cree.
        grupo.MapPost("/", async (GuardarUsuarioDto datos, AppDbContext db, CorreosSeguridad correos,
            TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var usuario = new Usuario(datos.Nombre, datos.Correo, datos.Rol);
            await ValidarCorreoUnico(db, usuario, ct);
            var token = ServicioTokens.NuevoTokenAleatorio();
            usuario.SolicitarCambioContrasena(ServicioTokens.Hash(token), ahora + CorreosSeguridad.VigenciaActivacion);
            db.Usuarios.Add(usuario);
            await db.SaveChangesAsync(ct);
            await correos.EnviarActivacionAsync(usuario, token, ct);
            return Results.Created($"/api/usuarios/{usuario.Id}", UsuarioDto.De(usuario, ahora));
        });

        grupo.MapPut("/{id:guid}", async (Guid id, GuardarUsuarioDto datos, ClaimsPrincipal yo, AppDbContext db,
            TimeProvider reloj, CancellationToken ct) =>
        {
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (usuario is null)
            {
                return Results.NotFound();
            }

            if (id == yo.IdUsuario() && datos.Rol != Rol.Administrador)
            {
                throw new ExcepcionDominio("No puedes quitarte el rol de Administrador a ti mismo.");
            }

            usuario.CambiarDatos(datos.Nombre, datos.Correo, datos.Rol);
            await ValidarCorreoUnico(db, usuario, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(UsuarioDto.De(usuario, reloj.GetUtcNow().UtcDateTime));
        });

        grupo.MapPost("/{id:guid}/inactivar", async (Guid id, ClaimsPrincipal yo, AppDbContext db, TimeProvider reloj, CancellationToken ct) =>
        {
            if (id == yo.IdUsuario())
            {
                throw new ExcepcionDominio("No puedes inactivar tu propio usuario.");
            }

            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id && u.Activo, ct);
            if (usuario is null)
            {
                return Results.NotFound();
            }

            usuario.Inactivar();
            await AutenticacionEndpoints.RevocarSesiones(db, id, reloj.GetUtcNow().UtcDateTime, ct);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        grupo.MapPost("/{id:guid}/reactivar", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id && !u.Activo, ct);
            if (usuario is null)
            {
                return Results.NotFound();
            }

            usuario.Reactivar();
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // Para quien no alcanzó a usar el enlace o lo perdió.
        grupo.MapPost("/{id:guid}/reenviar-acceso", async (Guid id, AppDbContext db, CorreosSeguridad correos,
            TimeProvider reloj, CancellationToken ct) =>
        {
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id && u.Activo, ct);
            if (usuario is null)
            {
                return Results.NotFound();
            }

            var token = ServicioTokens.NuevoTokenAleatorio();
            usuario.SolicitarCambioContrasena(ServicioTokens.Hash(token), reloj.GetUtcNow().UtcDateTime + CorreosSeguridad.VigenciaActivacion);
            await db.SaveChangesAsync(ct);
            await correos.EnviarActivacionAsync(usuario, token, ct);
            return Results.NoContent();
        });
    }

    private static async Task ValidarCorreoUnico(AppDbContext db, Usuario usuario, CancellationToken ct)
    {
        if (await db.Usuarios.AnyAsync(u => u.Correo == usuario.Correo && u.Id != usuario.Id, ct))
        {
            throw new ExcepcionDominio("Ya existe un usuario con ese correo.");
        }
    }
}
