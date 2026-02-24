# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY TaskManagement.Api/*.csproj ./
RUN dotnet restore

# Copy everything else and publish
COPY TaskManagement.Api/ ./
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
EXPOSE 8000

# Copy published app
COPY --from=build /app/out .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8000
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "TaskManagement.Api.dll"]
