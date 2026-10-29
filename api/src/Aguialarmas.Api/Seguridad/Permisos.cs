using Aguialarmas.Domain.Seguridad;
using Microsoft.AspNetCore.Authorization;

namespace Aguialarmas.Api.Seguridad;

/// <summary>
/// Qué puede hacer cada rol (WA-03). Igual que <c>permisos</c> en packages/shared/src/permisos.ts:
/// si cambias uno, cambia el otro.
/// </summary>
public static class Permisos
{
    public const string GestionarUsuarios = "usuarios.gestionar";
    public const string VerRutas = "rutas.ver";
    public const string GestionarRutas = "rutas.gestionar";

    private static readonly Dictionary<string, Rol[]> Roles = new()
    {
        [GestionarUsuarios] = [Rol.Administrador],
        [VerRutas] = [Rol.Administrador, Rol.UsuarioAdministrativo, Rol.DirectorTecnico, Rol.Supervisor],
        [GestionarRutas] = [Rol.Administrador, Rol.UsuarioAdministrativo],
    };

    public static void Registrar(AuthorizationOptions opciones)
    {
        foreach (var (permiso, roles) in Roles)
        {
            opciones.AddPolicy(permiso, p => p.RequireRole(roles.Select(r => r.ToString())));
        }

        // Todo endpoint exige sesión, salvo los marcados con AllowAnonymous.
        opciones.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    }
}
