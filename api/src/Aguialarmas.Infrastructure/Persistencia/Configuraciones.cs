using Aguialarmas.Domain.Auditoria;
using Aguialarmas.Domain.Clientes;
using Aguialarmas.Domain.Comun;
using Aguialarmas.Domain.Rutas;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aguialarmas.Infrastructure.Persistencia;

internal static class ConfiguracionComun
{
    public static void ConfigurarEntidad<T>(this EntityTypeBuilder<T> b) where T : Entidad
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.CreadoPor).HasMaxLength(120);
        b.Property(x => x.ModificadoPor).HasMaxLength(120);
        b.HasIndex(x => x.Activo);
    }
}

internal sealed class ClienteConfig : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> b)
    {
        b.ToTable("Clientes");
        b.ConfigurarEntidad();
        b.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        b.Property(x => x.Identificacion).HasMaxLength(30);
        b.HasMany(x => x.Cuentas).WithOne().HasForeignKey(x => x.ClienteId).OnDelete(DeleteBehavior.Restrict);
        b.Navigation(x => x.Cuentas).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

internal sealed class CuentaConfig : IEntityTypeConfiguration<Cuenta>
{
    public void Configure(EntityTypeBuilder<Cuenta> b)
    {
        b.ToTable("Cuentas");
        b.ConfigurarEntidad();
        b.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
        b.Property(x => x.Direccion).HasMaxLength(250).IsRequired();
        b.Property(x => x.Contacto).HasMaxLength(150);
        b.Property(x => x.CorreoContacto).HasMaxLength(200);
        b.Property(x => x.Ubicacion).HasColumnType("geography");
        b.HasOne<Ruta>().WithMany().HasForeignKey(x => x.RutaId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class RutaConfig : IEntityTypeConfiguration<Ruta>
{
    public void Configure(EntityTypeBuilder<Ruta> b)
    {
        b.ToTable("Rutas");
        b.ConfigurarEntidad();
        b.Property(x => x.Nombre).HasMaxLength(100).IsRequired();
        b.Property(x => x.Color).HasMaxLength(7).IsRequired();
        // geometry evita los problemas de orientación de anillos de geography; para una ciudad la precisión sobra.
        b.Property(x => x.Area).HasColumnType("geometry").IsRequired();
    }
}

internal sealed class RegistroAuditoriaConfig : IEntityTypeConfiguration<RegistroAuditoria>
{
    public void Configure(EntityTypeBuilder<RegistroAuditoria> b)
    {
        b.ToTable("Auditoria");
        b.HasKey(x => x.Id);
        b.Property(x => x.Usuario).HasMaxLength(120).IsRequired();
        b.Property(x => x.Modulo).HasMaxLength(60).IsRequired();
        b.Property(x => x.Entidad).HasMaxLength(80).IsRequired();
        b.Property(x => x.Accion).HasConversion<string>().HasMaxLength(20);
        b.HasIndex(x => new { x.Entidad, x.EntidadId });
        b.HasIndex(x => x.FechaUtc);
        b.HasIndex(x => x.Usuario);
    }
}
