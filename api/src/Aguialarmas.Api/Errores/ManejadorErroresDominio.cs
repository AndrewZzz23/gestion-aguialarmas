using Aguialarmas.Domain.Comun;
using Microsoft.AspNetCore.Diagnostics;

namespace Aguialarmas.Api.Errores;

/// <summary>Traduce las reglas de negocio incumplidas a 400 con ProblemDetails; el resto sigue como 500.</summary>
public sealed class ManejadorErroresDominio(IProblemDetailsService problemas) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception excepcion, CancellationToken ct)
    {
        if (excepcion is not ExcepcionDominio)
        {
            return false;
        }

        http.Response.StatusCode = StatusCodes.Status400BadRequest;
        return await problemas.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            Exception = excepcion,
            ProblemDetails =
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "No se pudo guardar",
                Detail = excepcion.Message,
            },
        });
    }
}
