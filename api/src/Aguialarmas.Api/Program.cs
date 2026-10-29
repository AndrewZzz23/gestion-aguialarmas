using Aguialarmas.Api.Endpoints;
using Aguialarmas.Api.Errores;
using Aguialarmas.Api.Seguridad;
using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ManejadorErroresDominio>();
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

app.MapRutas();

app.Run();

public partial class Program;
