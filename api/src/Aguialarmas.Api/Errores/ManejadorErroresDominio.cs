using Aguialarmas.Domain.Comun;
using Microsoft.AspNetCore.Diagnostics;

namespace Aguialarmas.Api.Errores;

/// <summary>
/// Traduce las reglas de negocio incumplidas y los datos mal formados (p. ej. un rol que no existe) a 400
/// con ProblemDetails; el resto sigue como 500.
/// </summary>
public sealed class ManejadorErroresDominio(IProblemDetailsService problemas) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception excepcion, CancellationToken ct)
    {
        var (estado, titulo, detalle) = excepcion switch
        {
            ExcepcionDominio => (StatusCodes.Status400BadRequest, "No se pudo guardar", excepcion.Message),
            BadHttpRequestException e => (e.StatusCode, "Solicitud no válida", "Los datos enviados no tienen el formato esperado."),
            _ => (0, "", ""),
        };

        if (estado == 0)
        {
            return false;
        }

        http.Response.StatusCode = estado;
        return await problemas.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            Exception = excepcion,
            ProblemDetails = { Status = estado, Title = titulo, Detail = detalle },
        });
    }
}
