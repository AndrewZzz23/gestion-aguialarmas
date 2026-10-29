using System.Text.Json.Serialization;
using Aguialarmas.Api.Endpoints;
using Aguialarmas.Api.Errores;
using Aguialarmas.Api.Seguridad;
using Aguialarmas.Application.Abstracciones;
using Aguialarmas.Domain.Seguridad;
using Aguialarmas.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ManejadorErroresDominio>();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioActual, UsuarioActualHttp>();
builder.Services.AddInfraestructura(builder.Configuration);

// Autenticación propia con JWT (WA-01) y permisos por rol (WA-03).
var jwt = builder.Configuration.GetSection(JwtOpciones.Seccion).Get<JwtOpciones>() ?? new JwtOpciones();
builder.Services.Configure<JwtOpciones>(builder.Configuration.GetSection(JwtOpciones.Seccion));
builder.Services.AddSingleton<ServicioTokens>();
builder.Services.AddSingleton<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddScoped<CorreosSeguridad>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
{
    o.MapInboundClaims = false;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = jwt.Emisor,
        ValidAudience = jwt.Audiencia,
        IssuerSigningKey = jwt.LlaveFirma(),
        NameClaimType = Reclamos.Correo,
        RoleClaimType = Reclamos.Rol,
        ClockSkew = TimeSpan.FromSeconds(30),
    };
});
builder.Services.AddAuthorization(Permisos.Registrar);

var origenes = builder.Configuration.GetSection("Cors:Origenes").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("web", p => p.WithOrigins(origenes).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous(); // /openapi/v1.json
}

app.UseExceptionHandler();
app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health").AllowAnonymous();

app.MapGet("/api/estado", (TimeProvider reloj) => new
{
    sistema = "Aguialarmas · Gestión de órdenes de trabajo",
    version = "0.1.0",
    horaUtc = reloj.GetUtcNow(),
}).AllowAnonymous();

app.MapAutenticacion();
app.MapUsuarios();
app.MapRutas();
app.MapClientes();

await AdminInicial.CrearSiNoHayUsuariosAsync(app.Services);

app.Run();

public partial class Program;
