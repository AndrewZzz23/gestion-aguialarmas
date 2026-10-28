using Aguialarmas.Domain.Clientes;
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
    public void Una_entidad_inactivada_no_se_borra()
    {
        var cuenta = new Cuenta(Guid.NewGuid(), "Sede Norte", "Calle 60 # 5-10");

        cuenta.Inactivar();

        Assert.False(cuenta.Activo);
    }
}
