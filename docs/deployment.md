# Deployment Guide (Northflank)

## Environment Setup

```bash
cp .env.example .env
# Edit .env:
DATABASE_URL=postgresql://postgres:password@localhost:5432/asset_manager_db
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API → Create OAuth 2.0 credentials
3. Add redirect URIs: `http://localhost:5000/api/auth/callback`, `https://your-domain.com/auth/callback`
4. Copy Client ID and Secret to `.env`

## Backend Deployment

**Dockerfile (backend/):**
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AssetManager.Api/AssetManager.Api.csproj", "AssetManager.Api/"]
RUN dotnet restore
COPY . .
WORKDIR "/src/AssetManager.Api"
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "AssetManager.Api.dll"]
```

**Deploy:**
```bash
northflank login
northflank project create --name asset-manager
northflank service create --name asset-manager-api --project asset-manager --docker-file backend/Dockerfile --port 5000
northflank addon create --name asset-manager-db --type postgresql --project asset-manager
```

### Northflank Environment Variables

**Secrets**: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
**Variables**: `CORS_ALLOWED_ORIGINS`, `API_ENVIRONMENT=Production`

## Frontend Deployment (Vercel — free)

```bash
cd frontend && npm install -g vercel && vercel --prod
# Set VITE_API_BASE_URL to your Northflank backend URL
```

## Database Migrations

```bash
northflank run --service asset-manager-api --command "dotnet ef database update"
```

## Monitoring & Rollback

```bash
northflank logs --service asset-manager-api --project asset-manager
northflank service rollback asset-manager-api --project asset-manager --revision <rev>
```

## Cost: ~$5-10/month (Backend $3-5, PostgreSQL $2-5, Frontend free on Vercel)

## CI/CD
Push to `main` → tests → Docker build → deploy → smoke tests. Never push with failing tests.
