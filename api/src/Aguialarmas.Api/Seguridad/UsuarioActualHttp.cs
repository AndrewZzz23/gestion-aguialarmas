using Aguialarmas.Application.Abstracciones;

namespace Aguialarmas.Api.Seguridad;

/// <summary>
/// Correo del usuario del token, para la auditoría. "anónimo" en peticiones sin sesión (ingreso fallido,
/// recuperación de contraseña) y "sistema" fuera de una petición (arranque, procesos internos).
/// </summary>
public sealed class UsuarioActualHttp(IHttpContextAccessor http) : IUsuarioActual
{
    public string Nombre => http.HttpContext switch
    {
        null => "sistema",
        { User.Identity.IsAuthenticated: true } c => c.User.Identity.Name ?? "anónimo",
        _ => "anónimo",
    };
}
