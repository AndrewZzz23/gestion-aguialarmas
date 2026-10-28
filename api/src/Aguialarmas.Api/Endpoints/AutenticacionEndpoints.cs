using System.Security.Claims;
using System.Text.Json;
using Aguialarmas.Api.Seguridad;
using Aguialarmas.Domain.Auditoria;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Seguridad;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aguialarmas.Api.Endpoints;

public sealed record UsuarioDto(Guid Id, string Nombre, string Correo, Rol Rol, bool Activo, bool ContrasenaDefinida, bool Bloqueado)
{
    public static UsuarioDto De(Usuario u, DateTime ahoraUtc) =>
        new(u.Id, u.Nombre, u.Correo, u.Rol, u.Activo, u.HashContrasena is not null, u.EstaBloqueado(ahoraUtc));
}

public sealed record SesionDto(string TokenAcceso, DateTime ExpiraUtc, string TokenRenovacion, UsuarioDto Usuario);

public sealed record IngresarDto(string Correo, string Contrasena);

public sealed record TokenRenovacionDto(string TokenRenovacion);

public sealed record RecuperarDto(string Correo);

public sealed record RestablecerDto(string Correo, string Token, string Contrasena);

/// <summary>Inicio de sesión, renovación y recuperación de contraseña (WA-01).</summary>
public static class AutenticacionEndpoints
{
    private const string MensajeCredenciales = "Correo o contraseña incorrectos.";

    public static void MapAutenticacion(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/auth").WithTags("Autenticación").AllowAnonymous();

        grupo.MapPost("/ingresar", async (IngresarDto datos, HttpContext http, AppDbContext db,
            IPasswordHasher<Usuario> hasher, ServicioTokens tokens, TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var usuario = await BuscarPorCorreo(db, datos.Correo, ct);
            if (usuario is null || !usuario.Activo || usuario.HashContrasena is null)
            {
                return NoAutorizado(MensajeCredenciales);
            }

            if (usuario.EstaBloqueado(ahora))
            {
                var minutos = Math.Ceiling((usuario.BloqueadoHastaUtc!.Value - ahora).TotalMinutes);
                return NoAutorizado($"La cuenta está bloqueada por intentos fallidos. Intenta de nuevo en {minutos} minutos.");
            }

            var verificacion = hasher.VerifyHashedPassword(usuario, usuario.HashContrasena, datos.Contrasena ?? "");
            if (verificacion == PasswordVerificationResult.Failed)
            {
                usuario.RegistrarIngresoFallido(ahora);
                await db.SaveChangesAsync(ct);
                return NoAutorizado(MensajeCredenciales);
            }

            if (verificacion == PasswordVerificationResult.SuccessRehashNeeded)
            {
                usuario.EstablecerContrasena(hasher.HashPassword(usuario, datos.Contrasena!));
            }

            usuario.RegistrarIngresoExitoso();
            var dispositivo = http.Request.Headers.UserAgent.ToString();
            var sesion = AbrirSesion(db, usuario, dispositivo, tokens, ahora, out var tokenRenovacion);
            db.Auditoria.Add(RegistroAuditoria.Crear(ahora, usuario.Correo, "Seguridad", nameof(Usuario), usuario.Id,
                AccionAuditoria.IniciarSesion, null, JsonSerializer.Serialize(new { Sesion = sesion.Id, Dispositivo = sesion.Dispositivo })));
            await db.SaveChangesAsync(ct);
            return Results.Ok(Sesion(usuario, tokenRenovacion, tokens, ahora));
        });

        // Rotación: cada renovación revoca el token usado y entrega uno nuevo.
        grupo.MapPost("/renovar", async (TokenRenovacionDto datos, AppDbContext db, ServicioTokens tokens,
            TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var sesion = await db.Sesiones.FirstOrDefaultAsync(s => s.HashToken == ServicioTokens.Hash(datos.TokenRenovacion ?? ""), ct);
            var usuario = sesion is null ? null : await db.Usuarios.FirstOrDefaultAsync(u => u.Id == sesion.UsuarioId, ct);
            if (sesion is null || !sesion.Vigente(ahora) || usuario is null || !usuario.Activo)
            {
                return NoAutorizado("La sesión venció. Ingresa de nuevo.");
            }

            sesion.Revocar(ahora);
            AbrirSesion(db, usuario, sesion.Dispositivo, tokens, ahora, out var tokenRenovacion);
            await db.SaveChangesAsync(ct);
            return Results.Ok(Sesion(usuario, tokenRenovacion, tokens, ahora));
        });

        // Funciona aunque el token de acceso ya haya vencido: basta el de renovación.
        grupo.MapPost("/salir", async (TokenRenovacionDto datos, AppDbContext db, TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var sesion = await db.Sesiones.FirstOrDefaultAsync(s => s.HashToken == ServicioTokens.Hash(datos.TokenRenovacion ?? ""), ct);
            if (sesion is null || sesion.RevocadaUtc is not null)
            {
                return Results.NoContent();
            }

            var usuario = await db.Usuarios.FirstAsync(u => u.Id == sesion.UsuarioId, ct);
            sesion.Revocar(ahora);
            db.Auditoria.Add(RegistroAuditoria.Crear(ahora, usuario.Correo, "Seguridad", nameof(Usuario), usuario.Id,
                AccionAuditoria.CerrarSesion, null, JsonSerializer.Serialize(new { Sesion = sesion.Id })));
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });

        // Fuera del grupo: AllowAnonymous del grupo ganaría sobre RequireAuthorization.
        app.MapGet("/api/auth/yo", async (ClaimsPrincipal yo, AppDbContext db, TimeProvider reloj, CancellationToken ct) =>
        {
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == yo.IdUsuario(), ct);
            return usuario is null ? Results.NotFound() : Results.Ok(UsuarioDto.De(usuario, reloj.GetUtcNow().UtcDateTime));
        }).WithTags("Autenticación");

        // Siempre responde 202 para no revelar qué correos existen.
        grupo.MapPost("/recuperar", async (RecuperarDto datos, AppDbContext db, CorreosSeguridad correos,
            TimeProvider reloj, ILogger<CorreosSeguridad> log, CancellationToken ct) =>
        {
            var usuario = await BuscarPorCorreo(db, datos.Correo, ct);
            if (usuario is { Activo: true })
            {
                var token = ServicioTokens.NuevoTokenAleatorio();
                usuario.SolicitarCambioContrasena(ServicioTokens.Hash(token), reloj.GetUtcNow().UtcDateTime + CorreosSeguridad.VigenciaRecuperacion);
                await db.SaveChangesAsync(ct);
                try
                {
                    await correos.EnviarRecuperacionAsync(usuario, token, ct);
                }
                catch (Exception ex)
                {
                    log.LogError(ex, "No se pudo enviar el correo de recuperación a {Correo}", usuario.Correo);
                }
            }

            return Results.Accepted();
        });

        grupo.MapPost("/restablecer", async (RestablecerDto datos, AppDbContext db, IPasswordHasher<Usuario> hasher,
            TimeProvider reloj, CancellationToken ct) =>
        {
            var ahora = reloj.GetUtcNow().UtcDateTime;
            var usuario = await BuscarPorCorreo(db, datos.Correo, ct);
            if (usuario is not { Activo: true } || !usuario.TokenContrasenaVigente(ServicioTokens.Hash(datos.Token ?? ""), ahora))
            {
                throw new ExcepcionDominio("El enlace no es válido o ya venció. Pide uno nuevo.");
            }

            Usuario.ValidarContrasena(datos.Contrasena);
            usuario.EstablecerContrasena(hasher.HashPassword(usuario, datos.Contrasena));
            await RevocarSesiones(db, usuario.Id, ahora, ct);
            await db.SaveChangesAsync(ct);
            return Results.NoContent();
        });
    }

    public static Guid IdUsuario(this ClaimsPrincipal usuario) =>
        Guid.TryParse(usuario.FindFirstValue(Reclamos.Id), out var id) ? id : Guid.Empty;

    public static async Task RevocarSesiones(AppDbContext db, Guid usuarioId, DateTime ahoraUtc, CancellationToken ct) =>
        await db.Sesiones.Where(s => s.UsuarioId == usuarioId && s.RevocadaUtc == null).ForEachAsync(s => s.Revocar(ahoraUtc), ct);

    private static async Task<Usuario?> BuscarPorCorreo(AppDbContext db, string? correo, CancellationToken ct)
    {
        var normalizado = (correo ?? "").Trim().ToLowerInvariant();
        return normalizado.Length == 0 ? null : await db.Usuarios.FirstOrDefaultAsync(u => u.Correo == normalizado, ct);
    }

    private static SesionUsuario AbrirSesion(AppDbContext db, Usuario usuario, string? dispositivo, ServicioTokens tokens,
        DateTime ahora, out string tokenRenovacion)
    {
        tokenRenovacion = ServicioTokens.NuevoTokenAleatorio();
        var sesion = new SesionUsuario(usuario.Id, ServicioTokens.Hash(tokenRenovacion), dispositivo, ahora);
        db.Sesiones.Add(sesion);
        return sesion;
    }

    private static SesionDto Sesion(Usuario usuario, string tokenRenovacion, ServicioTokens tokens, DateTime ahora)
    {
        var (acceso, expira) = tokens.CrearTokenAcceso(usuario);
        return new SesionDto(acceso, expira, tokenRenovacion, UsuarioDto.De(usuario, ahora));
    }

    private static IResult NoAutorizado(string mensaje) =>
        Results.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "No se pudo ingresar", detail: mensaje);
}
