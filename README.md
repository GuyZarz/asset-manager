# Asset Manager 📊

A modern, full-stack asset management application for tracking your portfolio of stocks, cryptocurrencies, and real estate investments.

![Asset Manager](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Multi-Asset Support**: Track stocks, cryptocurrencies, and real estate in one place
- **Real-Time Price Updates**: Automatic price fetching for stocks and crypto
- **Portfolio Analytics**:
  - Performance charts and historical tracking
  - Gain/Loss analysis by asset
  - Asset allocation visualization
  - Best/Worst performer statistics
- **Beautiful UI**:
  - Dark/Light/System theme support
  - Smooth scroll animations
  - Responsive design (mobile & desktop)
  - Clean, modern interface with Tailwind CSS
- **Symbol Validation**: Real-time validation for stock and crypto symbols
- **Currency Support**: Multi-currency support (USD, ILS, EUR, GBP, CAD)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **.NET 8** (ASP.NET Core)
- **PostgreSQL** database
- **Entity Framework Core** for ORM
- **RESTful API** architecture

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **.NET SDK** (v8.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/GuyZarz/asset-manager.git
cd asset-manager
```

### 2. Backend Setup

```bash
cd backend

# Update connection string in appsettings.Development.json
# Set your PostgreSQL connection details

# Run migrations
dotnet ef database update --project src/AssetManager.Infrastructure

# Start the backend server
dotnet run --project src/AssetManager.Api
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL in .env if needed
# Default: http://localhost:5000

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
asset-manager/
├── backend/
│   ├── src/
│   │   ├── AssetManager.Api/          # API controllers and middleware
│   │   ├── AssetManager.Domain/       # Entities and DTOs
│   │   └── AssetManager.Infrastructure/ # Database and services
│   └── tests/
│       └── AssetManager.Tests/        # Unit tests
├── frontend/
│   ├── src/
│   │   ├── api/                       # API client
│   │   ├── components/                # React components
│   │   ├── contexts/                  # React contexts
│   │   ├── hooks/                     # Custom hooks
│   │   ├── pages/                     # Page components
│   │   ├── types/                     # TypeScript types
│   │   └── utils/                     # Utility functions
│   └── public/                        # Static assets
└── docs/                              # Documentation
```

## 🎨 UI Features

- **Scroll Animations**: Smooth slide-up and fade-in effects
- **Stagger Animations**: Sequential animations for list items
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theme Support**: Dark, light, and system-based themes

## 🔑 Key Components

### Dashboard
- Portfolio overview with total value and gain/loss
- Performance chart showing historical data
- Asset allocation pie chart
- Top gainers and losers
- Asset list with sorting and filtering

### Asset Management
- Add/Edit/Delete assets
- Symbol validation for stocks and crypto
- Automatic price fetching
- Support for multiple asset types

### Profile
- User settings and preferences
- Currency selection
- Theme customization

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

### Backend
```bash
cd backend
dotnet publish -c Release
```

## 🌐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=assetmanager;Username=postgres;Password=yourpassword"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Guy Zarzar**
- GitHub: [@GuyZarz](https://github.com/GuyZarz)
- Email: guyzarz@gmail.com

## 🙏 Acknowledgments

- Built with the help of [Claude](https://claude.ai) - AI assistant by Anthropic
- Icons from [Heroicons](https://heroicons.com/)
- Charts powered by [Recharts](https://recharts.org/)

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
