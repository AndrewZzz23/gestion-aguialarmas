using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aguialarmas.Infrastructure.Persistencia.Migraciones
{
    /// <inheritdoc />
    public partial class Usuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Correo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    HashContrasena = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IntentosFallidos = table.Column<int>(type: "int", nullable: false),
                    BloqueadoHastaUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HashTokenContrasena = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TokenContrasenaExpiraUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreadoPor = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ModificadoEn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SesionesUsuario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HashToken = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Dispositivo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreadaUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiraUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevocadaUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SesionesUsuario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SesionesUsuario_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SesionesUsuario_HashToken",
                table: "SesionesUsuario",
                column: "HashToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SesionesUsuario_UsuarioId",
                table: "SesionesUsuario",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Activo",
                table: "Usuarios",
                column: "Activo");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Correo",
                table: "Usuarios",
                column: "Correo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SesionesUsuario");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
