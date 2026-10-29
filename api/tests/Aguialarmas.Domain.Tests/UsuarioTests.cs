using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Seguridad;

namespace Aguialarmas.Domain.Tests;

public class UsuarioTests
{
    private static readonly DateTime Ahora = new(2026, 10, 28, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void El_correo_se_guarda_en_minusculas_y_sin_espacios()
    {
        var usuario = new Usuario("Laura Gómez", "  Laura.Gomez@Aguialarmas.COM ", Rol.UsuarioAdministrativo);

        Assert.Equal("laura.gomez@aguialarmas.com", usuario.Correo);
    }

    [Theory]
    [InlineData("sin-arroba")]
    [InlineData("dos@@arrobas.com")]
    [InlineData("")]
    public void Rechaza_correos_invalidos(string correo)
    {
        Assert.Throws<ExcepcionDominio>(() => new Usuario("Laura", correo, Rol.Tecnico));
    }

    [Theory]
    [InlineData("corta1")]
    [InlineData("solamenteletras")]
    [InlineData("1234567890")]
    public void La_contrasena_exige_8_caracteres_con_letras_y_numeros(string contrasena)
    {
        Assert.Throws<ExcepcionDominio>(() => Usuario.ValidarContrasena(contrasena));
    }

    [Fact]
    public void Acepta_una_contrasena_valida()
    {
        Usuario.ValidarContrasena("Aguila2026");
    }

    [Fact]
    public void Se_bloquea_15_minutos_despues_de_5_intentos_fallidos()
    {
        var usuario = new Usuario("Carlos", "carlos@aguialarmas.com", Rol.Tecnico);

        for (var i = 0; i < Usuario.IntentosAntesDeBloquear - 1; i++)
        {
            usuario.RegistrarIngresoFallido(Ahora);
        }
        Assert.False(usuario.EstaBloqueado(Ahora));

        usuario.RegistrarIngresoFallido(Ahora);

        Assert.True(usuario.EstaBloqueado(Ahora.AddMinutes(14)));
        Assert.False(usuario.EstaBloqueado(Ahora.AddMinutes(15)));
    }

    [Fact]
    public void El_token_de_contrasena_vence_y_se_invalida_al_usarlo()
    {
        var usuario = new Usuario("Carlos", "carlos@aguialarmas.com", Rol.Tecnico);
        usuario.SolicitarCambioContrasena("HASH", Ahora.AddHours(1));

        Assert.True(usuario.TokenContrasenaVigente("HASH", Ahora));
        Assert.False(usuario.TokenContrasenaVigente("OTRO", Ahora));
        Assert.False(usuario.TokenContrasenaVigente("HASH", Ahora.AddHours(2)));

        usuario.EstablecerContrasena("hash-de-la-contrasena");

        Assert.False(usuario.TokenContrasenaVigente("HASH", Ahora));
    }

    [Fact]
    public void La_sesion_revocada_deja_de_estar_vigente()
    {
        var sesion = new SesionUsuario(Guid.NewGuid(), "HASH", "Chrome", Ahora);
        Assert.True(sesion.Vigente(Ahora.AddDays(29)));
        Assert.False(sesion.Vigente(Ahora.AddDays(31)));

        sesion.Revocar(Ahora.AddMinutes(5));

        Assert.False(sesion.Vigente(Ahora.AddMinutes(6)));
    }
}
