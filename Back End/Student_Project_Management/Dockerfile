FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["Student_Project_Management.csproj", "./"]

RUN dotnet restore "Student_Project_Management.csproj"

COPY . .

RUN dotnet publish "Student_Project_Management.csproj" -c Release -o /app/publish --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "Student_Project_Management.dll"]