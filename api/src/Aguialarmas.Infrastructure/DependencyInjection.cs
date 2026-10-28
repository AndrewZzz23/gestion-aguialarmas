using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Infrastructure.Archivos;
using Aguialarmas.Infrastructure.Correo;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aguialarmas.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfraestructura(this IServiceCollection services, IConfiguration configuracion)
    {
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<AuditoriaInterceptor>();

        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.UseSqlServer(
                configuracion.GetConnectionString("Aguialarmas"),
                sql => sql.UseNetTopologySuite().EnableRetryOnFailure());
            options.AddInterceptors(sp.GetRequiredService<AuditoriaInterceptor>());
        });

        services.Configure<AlmacenamientoOpciones>(configuracion.GetSection(AlmacenamientoOpciones.Seccion));
        services.AddSingleton<IAlmacenArchivos, BlobAlmacenArchivos>();

        services.Configure<CorreoOpciones>(configuracion.GetSection(CorreoOpciones.Seccion));
        services.AddTransient<IServicioCorreo, SmtpServicioCorreo>();

        services.AddHealthChecks().AddDbContextCheck<AppDbContext>("sql");

        return services;
    }
}
