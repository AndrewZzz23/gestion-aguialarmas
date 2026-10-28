using Aguialarmas.Domain.Auditoria;
using Aguialarmas.Domain.Clientes;
using Aguialarmas.Domain.Rutas;
using Microsoft.EntityFrameworkCore;

namespace Aguialarmas.Infrastructure.Persistencia;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Cuenta> Cuentas => Set<Cuenta>();
    public DbSet<Ruta> Rutas => Set<Ruta>();
    public DbSet<RegistroAuditoria> Auditoria => Set<RegistroAuditoria>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
