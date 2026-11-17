using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Student_Project_Management.Data;
using Student_Project_Management.Helpers;
using Student_Project_Management.Repositories.Implementations;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services;
using Student_Project_Management.Services.Implementations;
using Student_Project_Management.Services.Interfaces;
using Student_Project_Management.Validators;
using System.Text;

namespace Student_Project_Management
{
    public class Program
    {
        public static void Main(string[] args)
        {
            DotEnv.Load();

            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                    ?? Environment.GetEnvironmentVariable("DEFAULT_CONNECTION")
                    ?? Environment.GetEnvironmentVariable("DefaultConnection");
            }
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
            }

            var jwtKey = builder.Configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                jwtKey = Environment.GetEnvironmentVariable("Jwt__Key")
                    ?? Environment.GetEnvironmentVariable("JWT_KEY")
                    ?? "ThisIsMySuperSecretKey1234567890";
            }
            if (!string.IsNullOrWhiteSpace(jwtKey))
            {
                builder.Configuration["Jwt:Key"] = jwtKey;
            }

            // Add services to the container.

            builder.Services.AddControllers();

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Rules the app uses to check if a token is valid
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true, //confirms the token was signed with our secret key, not a fake one.

                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtKey!)
                        ),
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Components ??= new OpenApiComponents();
                    document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                    document.Components.SecuritySchemes.Add(
                        "Bearer",
                        new OpenApiSecurityScheme
                        {
                            Type = SecuritySchemeType.Http,
                            Scheme = "bearer",
                            BearerFormat = "JWT",
                            In = ParameterLocation.Header,
                            Description = "Enter JWT token"
                        });

                    return Task.CompletedTask;
                });
            });


            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });


            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IRoleService, RoleService>();
            builder.Services.AddScoped<IUserTypeService, UserTypeService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IUserRoleService, UserRoleService>();
            builder.Services.AddScoped<ITaskStatusService, TaskStatusService>();
            builder.Services.AddScoped<ITaskPriorityService, TaskPriorityService>();
            builder.Services.AddScoped<IProjectMasterService, ProjectMasterService>();
            builder.Services.AddScoped<IProjectAllocationService, ProjectAllocationService>();
            builder.Services.AddScoped<ITaskService, TaskService>();
            builder.Services.AddScoped<ITokenService, TokenService>();

            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            builder.Services.AddScoped<IUserTypeRepository, UserTypeRepository>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
            builder.Services.AddScoped<ITaskStatusRepository, TaskStatusRepository>();
            builder.Services.AddScoped<ITaskPriorityRepository, TaskPriorityRepository>();
            builder.Services.AddScoped<IProjectMasterRepository, ProjectMasterRepository>();
            builder.Services.AddScoped<IProjectAllocationRepository, ProjectAllocationRepository>();
            builder.Services.AddScoped<ITaskRepository, TaskRepository>();

            builder.Services.AddValidatorsFromAssemblyContaining<RoleValidator>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}