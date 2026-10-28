using Aguialarmas.Api.Seguridad;
using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Infrastructure;
using Aguialarmas.Infrastructure.Persistencia;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioActual, UsuarioActualHttp>();
builder.Services.AddInfraestructura(builder.Configuration);

var origenes = builder.Configuration.GetSection("Cors:Origenes").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("web", p => p.WithOrigins(origenes).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json
}

app.UseExceptionHandler();
app.UseCors("web");

app.MapHealthChecks("/health");

app.MapGet("/api/estado", (TimeProvider reloj) => new
{
    sistema = "Aguialarmas · Gestión de órdenes de trabajo",
    version = "0.1.0",
    horaUtc = reloj.GetUtcNow(),
});

app.MapGet("/api/rutas", async (AppDbContext db, CancellationToken ct) =>
    await db.Rutas
        .Where(r => r.Activo)
        .OrderBy(r => r.Nombre)
        .Select(r => new { r.Id, r.Nombre, r.Color })
        .ToListAsync(ct));

app.Run();

public partial class Program;
