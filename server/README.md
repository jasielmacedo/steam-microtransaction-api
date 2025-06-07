# Steam Microtransaction API (Python FastAPI Version)

This is a Python FastAPI-based implementation of the Steam Microtransaction API, which provides an intermediate API to handle Steam microtransactions using Steam web services.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **User Management**: Admin panel for managing users
- **Steam API Integration**: All necessary endpoints for Steam microtransactions
- **API Documentation**: Comprehensive API documentation with Swagger UI

## Requirements

- Python 3.11 or higher
- Docker and Docker Compose (optional, for containerization)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and update the configuration
3. Run using Docker Compose:

```bash
docker-compose up -d
```


### Manual Setup

1. Clone the repository
2. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and update the configuration
4. Start the application:

```bash
python start.py
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:3000/docs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DEBUG | Enable debug mode | False |
| ENVIRONMENT | Environment (development, production) | development |
| PORT | Server port | 3000 |
| JWT_SECRET | Secret key for JWT tokens | microtrax-jwt-secret |
| ADMIN_EMAIL | Default admin email | admin@example.com |
| ADMIN_PASSWORD | Default admin password | adminPassword123 |
| STEAM_API_KEY | Steam API Key | |
| STEAM_PUBLISHER_KEY | Steam Publisher Key | |
| STEAM_APP_ID | Steam App ID | |

## Project Structure

```
server/
├── app/                      # Application code
│   ├── api/                  # API-related code
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   └── schemas/          # Pydantic schemas
│   ├── core/                 # Core application code
│   │   ├── config.py         # Configuration
│   │   ├── exceptions.py     # Custom exceptions
│   │   ├── init_data.py      # Initialization data
│   │   └── security.py       # Security utilities
│   ├── db/                   # Database-related code
│   │   └── sqlite.py         # SQLite connection
│   ├── utils/                # Utility functions
│   └── main.py               # Main application
├── static/                   # Static files
├── tests/                    # Tests
├── .env.example              # Example environment variables
├── Dockerfile                # Docker configuration
├── README.md                 # This file
├── requirements.txt          # Python dependencies
└── start.py                  # Start script
```

## Security Considerations

- Change default admin credentials in production
- Use a strong JWT secret key
- Keep your Steam API keys secure
- Use HTTPS in production