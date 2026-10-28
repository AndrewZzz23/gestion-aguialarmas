using Aguialarmas.Domain.Seguridad;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aguialarmas.Api.Seguridad;

/// <summary>
/// Crea el primer Administrador cuando la base no tiene usuarios, con los datos de la sección AdminInicial.
/// Local: appsettings.Development.json. Producción: configuración del App Service, y se borra después del primer arranque.
/// </summary>
public static class AdminInicial
{
    public static async Task CrearSiNoHayUsuariosAsync(IServiceProvider servicios)
    {
        using var alcance = servicios.CreateScope();
        var configuracion = alcance.ServiceProvider.GetRequiredService<IConfiguration>().GetSection("AdminInicial");
        var correo = configuracion["Correo"];
        var contrasena = configuracion["Contrasena"];
        if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrWhiteSpace(contrasena))
        {
            return;
        }

        var db = alcance.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.Usuarios.AnyAsync())
        {
            return;
        }

        var hasher = alcance.ServiceProvider.GetRequiredService<IPasswordHasher<Usuario>>();
        var admin = new Usuario(configuracion["Nombre"] ?? "Administrador", correo, Rol.Administrador);
        Usuario.ValidarContrasena(contrasena);
        admin.EstablecerContrasena(hasher.HashPassword(admin, contrasena));
        db.Usuarios.Add(admin);
        await db.SaveChangesAsync();
        alcance.ServiceProvider.GetRequiredService<ILogger<Usuario>>().LogWarning(
            "Se creó el administrador inicial {Correo}. Cambia su contraseña y quita AdminInicial de la configuración.", admin.Correo);
    }
}
