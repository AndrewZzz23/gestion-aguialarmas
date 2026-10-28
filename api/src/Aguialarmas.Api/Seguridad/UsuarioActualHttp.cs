using Aguialarmas.Application.Abstracciones;

namespace Aguialarmas.Api.Seguridad;

/// <summary>Toma el usuario del token. Mientras no haya autenticación (WA-01), queda "sistema".</summary>
public sealed class UsuarioActualHttp(IHttpContextAccessor http) : IUsuarioActual
{
    public string Nombre => http.HttpContext?.User.Identity?.Name ?? "sistema";
}
