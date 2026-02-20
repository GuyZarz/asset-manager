FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY *.sln .
COPY src/AssetManager.Api/AssetManager.Api.csproj src/AssetManager.Api/
COPY src/AssetManager.Domain/AssetManager.Domain.csproj src/AssetManager.Domain/
COPY src/AssetManager.Infrastructure/AssetManager.Infrastructure.csproj src/AssetManager.Infrastructure/
RUN dotnet restore

COPY . .
RUN dotnet publish src/AssetManager.Api/AssetManager.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "AssetManager.Api.dll"]
