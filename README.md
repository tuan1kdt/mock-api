# Mock API

> A modern, full-stack mock API service built for learning coding with AI and educational purposes. Create, manage, and serve mock APIs instantly without authentication.

## 🚀 Features

- **Instant Mock API Creation**: Define your JSON response and get a live endpoint immediately
- **Full HTTP Method Support**: Create mocks for GET, POST, PUT, DELETE, and more
- **Customizable Responses**: Set custom status codes, headers, and response bodies
- **Dual Server Architecture**: Separate management and serving endpoints for better organization
- **Modern Tech Stack**: Built with Go (Gin), PostgreSQL, Next.js, and TypeScript
- **Easy Local Development**: Docker Compose setup for quick start

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Go](https://golang.org/dl/) (version 1.25 or higher)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [PostgreSQL](https://www.postgresql.org/download/) (optional, if not using Docker)

## 🏗️ Architecture

This project consists of two main components:

### Backend (Go)
- **Management Server** (Port 8080): API for creating and managing mock endpoints
- **Serving Server** (Port 8000): Serves the actual mock API responses
- **Database**: PostgreSQL for persistent storage

### Frontend (Next.js)
- Modern React application with TypeScript
- Tailwind CSS for styling
- Dark mode support

## 🚀 Quick Start with Docker Compose

The easiest way to get started is using Docker Compose, which sets up PostgreSQL automatically:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mock-api
   ```

2. **Start PostgreSQL with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This will automatically:
   - Start a PostgreSQL container
   - Create the `mock_api` database
   - Run the database schema migration (on first run)

3. **Set up the backend**
   ```bash
   cd backend
   
   # Create .env file with the following content:
   # MANAGEMENT_PORT=8080
   # SERVING_PORT=8000
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=postgres
   # DB_PASSWORD=postgres
   # DB_NAME=mock_api
   
   # If the schema wasn't auto-applied, initialize the database:
   go run scripts/init_db.go
   
   # Run the backend server
   go run cmd/server/main.go
   ```

4. **Set up the frontend** (in a new terminal)
   ```bash
   cd front-end
   
   # Install dependencies
   npm install
   
   # Run the development server
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Management API: http://localhost:8080
   - Serving API: http://localhost:8000

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Ports
MANAGEMENT_PORT=8080
SERVING_PORT=8000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mock_api
```

**Note**: If using Docker Compose, the database configuration is already set up. Just use the values from the `docker-compose.yml` file.

### Frontend Configuration

The frontend is configured to connect to the backend API. Update the API endpoints in the frontend code if you change the backend ports.

## 📦 Manual Setup (Without Docker)

If you prefer to run PostgreSQL manually:

1. **Install and start PostgreSQL**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql
   brew services start postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql
   sudo systemctl start postgresql
   ```

2. **Create the database**
   ```bash
   createdb mock_api
   ```

3. **Run the schema migration**
   ```bash
   cd backend
   psql -d mock_api -f sql/schema/001_init.sql
   ```

4. **Configure and run the backend** (follow steps 3-4 from Quick Start)

## 🛠️ Development

### Backend Development

```bash
cd backend

# Run the server
go run cmd/server/main.go

# Run database initialization
go run scripts/init_db.go

# Run tests (if available)
go test ./...
```

### Frontend Development

```bash
cd front-end

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📚 API Documentation

### Management API (Port 8080)

#### Create a Mock API
```http
POST /api/mocks
Content-Type: application/json

{
  "method": "GET",
  "path": "/users",
  "responseStatus": 200,
  "responseBody": {
    "users": [
      {"id": 1, "name": "John Doe"}
    ]
  }
}
```

#### List All Mocks
```http
GET /api/mocks
```

### Serving API (Port 8000)

The serving API will respond to any request matching the path and method of your created mocks.

```http
GET http://localhost:8000/users
```

## 🗄️ Database Schema

The application uses a single `mocks` table:

```sql
CREATE TABLE mocks (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    response_status INT NOT NULL,
    response_body TEXT NOT NULL,
    hit_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

## 🐳 Docker

### Build Backend Image

```bash
cd backend
docker build -t mock-api-backend .
```

### Run with Docker

```bash
docker run -p 8080:8080 -p 8000:8000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=mock_api \
  mock-api-backend
```

## 🤝 Contributing

This is an educational project for learning coding with AI. Contributions, suggestions, and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Built for learning and educational purposes
- Designed to demonstrate modern full-stack development practices
- Great for understanding API design, database management, and containerization

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.

---

**Happy Coding! 🎉**

