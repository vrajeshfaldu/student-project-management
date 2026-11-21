# Student Project Management

A full-stack Student Project Management System for organizing projects, tasks, users, roles, and dashboards. The project combines a React frontend with an ASP.NET Core Web API and SQL Server database.

[![Live Demo](https://img.shields.io/badge/Live-Demo-2563eb?style=for-the-badge)](https://student-project-management-black.vercel.app)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-10-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)

## Overview

Student Project Management centralizes the administration and tracking of academic projects. It provides JWT-based authentication, role-based authorization, project and task workflows, user administration, dashboard insights, and server-side validation.

**Live application:** https://student-project-management-black.vercel.app

## Key Features

- Secure JWT authentication and authorization
- Role and user type management
- User creation and account administration
- Project creation and project detail management
- Task creation, assignment, and status tracking
- Dashboard summaries and project/task statistics
- FluentValidation request validation
- Entity Framework Core migrations and SQL Server integration
- OpenAPI documentation with Scalar UI
- Docker-ready ASP.NET Core backend
- Responsive React interface with Tailwind CSS

## Tech Stack

### Frontend

- React 19
- Vite 8
- React Router 7
- Axios
- Tailwind CSS 4
- React Hook Form
- Recharts
- Lucide React and React Icons
- jwt-decode

### Backend

- ASP.NET Core 10 Web API
- Entity Framework Core 10
- SQL Server
- JWT Bearer authentication
- FluentValidation
- OpenAPI and Scalar

### DevOps

- Docker
- Vercel frontend deployment

## Project Structure

```text
student-project-management/
├── Back End/
│   └── Student_Project_Management/
│       ├── Controllers/       # API endpoints
│       ├── DTOs/              # Request and response models
│       ├── Data/              # EF Core database context
│       ├── Helpers/           # Shared application helpers
│       ├── Migrations/        # Database migrations
│       ├── Models/            # Domain entities
│       ├── Repositories/      # Data access implementations
│       ├── Services/          # Business logic
│       ├── Validators/        # FluentValidation rules
│       ├── wwwroot/           # Published static/API assets
│       ├── Program.cs         # Application configuration
│       └── Dockerfile         # Backend container configuration
└── Front End/
    └── student-project-management/
        ├── public/
        ├── src/
        ├── package.json
        └── vite.config.js
```

## Prerequisites

Install the following tools before running the project:

- [.NET SDK 10.0](https://dotnet.microsoft.com/download)
- [Node.js 20 or newer](https://nodejs.org/) with npm
- [SQL Server](https://www.microsoft.com/sql-server) or SQL Server LocalDB
- Git
- Docker (optional)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vrajeshfaldu/student-project-management.git
cd student-project-management
```

### 2. Configure the Backend

Navigate to the API project:

```bash
cd "Back End/Student_Project_Management"
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Update `.env` with a valid SQL Server connection and a secret key of at least 32 characters:

```dotenv
ConnectionStrings__DefaultConnection="Server=YOUR_SERVER_NAME;Database=SPM_Database;Trusted_Connection=True;TrustServerCertificate=True;"
Jwt__Key="YourSuperSecretKeyHere_MustBeAtLeast32Chars"
```

For SQL Server authentication, an example connection string is:

```text
Server=localhost;Database=SPM_Database;User Id=YOUR_USER_ID;Password=YOUR_PASSWORD;TrustServerCertificate=True;
```

Do not commit real database credentials or JWT secrets.

### 3. Apply Database Migrations

Using the .NET CLI:

```bash
dotnet tool install --global dotnet-ef --version 10.0.10
dotnet ef database update
```

If using Visual Studio, migrations can also be applied from the Package Manager Console:

```powershell
Update-Database
```

### 4. Run the Backend

```bash
dotnet restore
dotnet run
```

The API HTTPS port is configured in `Properties/launchSettings.json`. After startup, open the scalar or OpenAPI endpoint shown in the terminal, typically a URL such as:

```text
https://localhost:<port>/scalar
https://localhost:<port>/openapi/v1.json
```

### 5. Configure and Run the Frontend

Open another terminal:

```bash
cd "Front End/student-project-management"
npm install
npm run dev
```

Vite will print the local development URL, usually:

```text
http://localhost:5173
```

## Environment Variables

The backend accepts configuration through `appsettings.json`, environment variables, or a local `.env` file.

| Variable | Required | Description |
|---|---:|---|
| `ConnectionStrings__DefaultConnection` | Yes | SQL Server database connection string |
| `DEFAULT_CONNECTION` | Alternative | Alternative database connection variable |
| `Jwt__Key` | Yes | Secret key used to sign JWT tokens |
| `JWT_KEY` | Alternative | Alternative JWT secret variable |
| `Jwt__Issuer` | Optional | Token issuer; defaults are defined in configuration |
| `Jwt__Audience` | Optional | Token audience; defaults are defined in configuration |

## API Documentation

When running locally, the API exposes OpenAPI metadata and a Scalar interface. Swagger-compatible clients can import:

```text
/openapi/v1.json
```

Protected endpoints use bearer authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## API Modules

The backend is organized into modules such as:

- Authentication
- Dashboard
- Roles
- User types
- Users
- User roles
- Projects
- Tasks
- Task status

Exact route names can be viewed from the running API's generated OpenAPI documentation.

## Docker Deployment

Build the backend image from the API project directory:

```bash
cd "Back End/Student_Project_Management"
docker build -t student-project-management-api .
```

Run the container:

```bash
docker run --name spm-api -p 10000:10000 \
  -e ConnectionStrings__DefaultConnection="YOUR_CONNECTION_STRING" \
  -e Jwt__Key="YOUR_SECRET_KEY_AT_LEAST_32_CHARACTERS" \
  student-project-management-api
```

The backend Docker configuration listens on port `10000`.

## Frontend Production Build

```bash
cd "Front End/student-project-management"
npm run build
npm run preview
```

The generated production files are placed in the `dist/` directory.

## Development Notes

- Update CORS and API base URL configuration before deploying the frontend and backend to separate domains.
- Use strong, environment-specific JWT secrets in production.
- Store production database credentials in a secure secret manager.
- Review generated migrations before applying them to a production database.
- The backend uses Entity Framework Core and SQL Server migrations.

## Security

- Never commit `.env`, database passwords, or JWT secrets.
- Use HTTPS in production.
- Rotate signing keys if they are exposed.
- Grant database and application users only the permissions they require.
- Keep dependencies and SDK packages updated.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push the branch:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a pull request.

## License

No license has currently been specified for this repository. If you plan to reuse or distribute this project, add an appropriate license before doing so.

## Author

**Vrajesh Faldu**

- GitHub: [@vrajeshfaldu](https://github.com/vrajeshfaldu)
- Live demo: https://student-project-management-black.vercel.app
