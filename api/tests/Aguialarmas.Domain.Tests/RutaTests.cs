using Aguialarmas.Domain.Clientes;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Rutas;
using NetTopologySuite.Geometries;

namespace Aguialarmas.Domain.Tests;

public class RutaTests
{
    private static Polygon Cuadro(double lng1, double lat1, double lng2, double lat2) =>
        new GeometryFactory(new PrecisionModel(), 4326).CreatePolygon(
        [
            new Coordinate(lng1, lat1), new Coordinate(lng2, lat1),
            new Coordinate(lng2, lat2), new Coordinate(lng1, lat2),
            new Coordinate(lng1, lat1),
        ]);

    [Fact]
    public void La_ruta_contiene_una_cuenta_ubicada_dentro()
    {
        var centro = new Ruta("Centro", "#A17800", Cuadro(-75.25, 4.43, -75.22, 4.45));
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Centro", "Cra 3 # 10-20");
        cuenta.UbicarEn(latitud: 4.44, longitud: -75.23);

        Assert.True(centro.Contiene(cuenta.Ubicacion!));
    }

    [Fact]
    public void Las_rutas_que_comparten_area_se_cruzan()
    {
        var centro = new Ruta("Centro", "#FFD200", Cuadro(-75.25, 4.43, -75.22, 4.45));
        var norte = new Ruta("Norte", "#141414", Cuadro(-75.23, 4.44, -75.20, 4.47));

        Assert.True(centro.SeCruzaCon(norte));
    }

    [Fact]
    public void Las_rutas_vecinas_que_solo_comparten_borde_no_se_cruzan()
    {
        var centro = new Ruta("Centro", "#FFD200", Cuadro(-75.25, 4.43, -75.22, 4.45));
        var norte = new Ruta("Norte", "#141414", Cuadro(-75.25, 4.45, -75.22, 4.47));

        Assert.False(centro.SeCruzaCon(norte));
    }

    [Theory]
    [InlineData("", "#FFD200")]
    [InlineData("Centro", "amarillo")]
    [InlineData("Centro", "#FFD20")]
    public void La_ruta_exige_nombre_y_color_hexadecimal(string nombre, string color)
    {
        Assert.Throws<ExcepcionDominio>(() => new Ruta(nombre, color, Cuadro(-75.25, 4.43, -75.22, 4.45)));
    }

    [Fact]
    public void La_ruta_no_acepta_un_poligono_que_se_cruza_consigo_mismo()
    {
        var corbatin = new GeometryFactory(new PrecisionModel(), 4326).CreatePolygon(
        [
            new Coordinate(-75.25, 4.43), new Coordinate(-75.22, 4.45),
            new Coordinate(-75.22, 4.43), new Coordinate(-75.25, 4.45),
            new Coordinate(-75.25, 4.43),
        ]);

        Assert.Throws<ExcepcionDominio>(() => new Ruta("Centro", "#FFD200", corbatin));
    }

    [Fact]
    public void Una_entidad_inactivada_no_se_borra()
    {
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Norte", "Calle 60 # 5-10");

        cuenta.Inactivar();

        Assert.False(cuenta.Activo);
    }
}
