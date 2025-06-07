# Steam Microtransaction API

An intermediate API to handle Steam microtransactions using Steam web services.

## Overview

This project provides an API to handle Steam microtransactions, and includes:

- **Backend API**: Python FastAPI server that communicates with the Steam API
- **Admin UI**: React admin panel to manage users, view transactions, and generate API keys
- **Docker Support**: Containerized setup for easy deployment

## Requirements

- Docker and Docker Compose (recommended)
- MongoDB
- Steam API and Publisher keys

## Quick Start

1. Clone this repository
2. Configure your environment variables (see below)
3. Start the services:

```bash
# For development
docker-compose -f docker-compose.dev.yml up

# For production
docker-compose up -d
```

## Environment Variables

Set these environment variables or create a `.env` file:

```
# Steam API Keys
STEAM_API_KEY=your_steam_api_key
STEAM_PUBLISHER_KEY=your_steam_publisher_key
STEAM_APP_ID=your_app_id
```

## Project Structure

```
.
├── admin-ui/              # React Admin Dashboard
├── old-server/            # Original Node.js implementation 
├── server/                # Python FastAPI implementation
├── docker-compose.yml     # Production Docker configuration
└── docker-compose.dev.yml # Development Docker configuration
```

## Admin Interface

The Admin UI is available at http://localhost:5173 and provides:

- User management
- API key generation
- Transaction history
- Dashboard with metrics

Default admin credentials:
- Email: `admin@example.com`
- Password: `adminPassword123`

**Important:** Change these credentials in production!

## API Endpoints

The API is available at http://localhost:3000 and provides:

- Authentication: `/api/v1/auth/*`
- Admin functions: `/api/v1/admin/*`
- Steam microtransaction endpoints:
  - `/GetReliableUserInfo`
  - `/CheckAppOwnership`
  - `/InitPurchase`
  - `/FinalizePurchase`
  - `/CheckPurchaseStatus`

Documentation is available at http://localhost:3000/docs

## Game Integration

Example integrations are provided for:
- Unity (C#)
- Unreal Engine (C++)

See the `examples` directory for implementation details.

## Support

For questions and support, please open an issue on GitHub.

## License

This project is licensed under the ISC License - see the LICENSE.txt file for details.