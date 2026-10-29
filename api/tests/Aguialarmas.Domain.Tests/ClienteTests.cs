using Aguialarmas.Domain.Clientes;
using Aguialarmas.Domain.Comun;

namespace Aguialarmas.Domain.Tests;

public class ClienteTests
{
    [Fact]
    public void El_cliente_exige_nombre_y_la_identificacion_vacia_queda_nula()
    {
        Assert.Throws<ExcepcionDominio>(() => new Cliente("  ", "900123"));

        var cliente = new Cliente(" Almacenes Éxito ", "   ");

        Assert.Equal("Almacenes Éxito", cliente.Nombre);
        Assert.Null(cliente.Identificacion);
    }

    [Theory]
    [InlineData("", "Cra 3 # 10-20")]
    [InlineData("Sede Centro", " ")]
    public void La_cuenta_exige_nombre_y_direccion(string nombre, string direccion)
    {
        Assert.Throws<ExcepcionDominio>(() => new Cuenta(Guid.NewGuid(), nombre, direccion));
    }

    [Fact]
    public void La_ubicacion_se_guarda_con_longitud_primero()
    {
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Centro", "Cra 3 # 10-20");

        cuenta.UbicarEn(latitud: 4.44, longitud: -75.23);

        Assert.Equal(-75.23, cuenta.Ubicacion!.X);
        Assert.Equal(4.44, cuenta.Ubicacion.Y);
        Assert.Equal(4326, cuenta.Ubicacion.SRID);
    }

    [Theory]
    [InlineData(19)]
    [InlineData(1001)]
    public void El_perimetro_de_llegada_tiene_limites(int metros)
    {
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Centro", "Cra 3 # 10-20");

        Assert.Throws<ExcepcionDominio>(() => cuenta.CambiarRadioLlegada(metros));
        Assert.Equal(Cuenta.RadioLlegadaPorDefectoM, cuenta.RadioLlegadaM);
    }

    [Fact]
    public void El_correo_de_contacto_se_valida_y_se_guarda_en_minusculas()
    {
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Centro", "Cra 3 # 10-20");

        Assert.Throws<ExcepcionDominio>(() => cuenta.CambiarContacto("Ana", "no-es-correo"));

        cuenta.CambiarContacto(" Ana Ruiz ", " Ana@Exito.COM ");

        Assert.Equal("Ana Ruiz", cuenta.Contacto);
        Assert.Equal("ana@exito.com", cuenta.CorreoContacto);
    }
}
