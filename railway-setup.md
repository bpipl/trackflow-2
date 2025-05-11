# Railway Setup for Track Flow Courier Application

This document provides a comprehensive guide on how the Track Flow Courier application was set up on Railway.app with a PostgreSQL database.

## Setup Overview

The Track Flow Courier application has been successfully deployed on Railway with the following components:

1. A React frontend (built with Vite) served through Express.js
2. A Node.js/Express backend API for handling data operations
3. A PostgreSQL database hosted on Railway

## Railway Configuration

### Project Structure
- **Service Name**: trackflow-2
- **Environment**: production
- **Domain**: trackflow-2-production.up.railway.app
- **Region**: europe-west4

### Environment Variables
The following environment variables have been configured:

- `DATABASE_URL`: PostgreSQL connection string provided by Railway
- `JWT_SECRET`: Secret key for JWT token generation and validation
- `NODE_ENV`: Set to "production"
- `PORT`: Set to 10000

### Database Configuration
The PostgreSQL database has been provisioned with the following details:

- **Host**: caboose.proxy.rlwy.net
- **Port**: 11599
- **Database Name**: railway
- **Username**: postgres

The database schema is initialized from the migrations in `server/db/migrations.sql`.

## Deployment Setup

### Build Process
The application uses a Nixpacks builder with the following configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "node server/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### File Structure
- React frontend code is in `/src`
- Server code is in `/server`
- Backend routes are in `/server/routes`
- Database migrations are in `/server/db/migrations.sql`

## Using the Application

The application is accessible at: https://trackflow-2-production.up.railway.app/

The backend API endpoints are:
- `/api/auth` - Authentication endpoints
- `/api/customers` - Customer management
- `/api/couriers` - Courier management
- `/api/slips` - Shipping slips
- `/api/sender-addresses` - Sender address management
- `/api/audit-logs` - System audit logs
- `/health` - Health check endpoint

## Connecting Local Development

If you want to connect your local development environment to the Railway database:

1. Install the Railway CLI: `npm i -g @railway/cli`
2. Login to Railway: `railway login`
3. Link your project: `railway link`
4. Use variables in your local environment: `railway variables`
5. Run locally using the Railway variables: `railway run npm run dev`

## Notes on Setup Process

1. Created a new Railway project
2. Added a PostgreSQL plugin to the project
3. Created a new service for the application
4. Set up necessary environment variables
5. Configured the railway.json with build and deployment settings
6. Connected the Railway project to the GitHub repository
7. Deployed the application with `railway up` command

## Troubleshooting

If the application fails to start or respond:

1. Check Railway logs: `railway logs`
2. Verify database connectivity
3. Ensure all required environment variables are set properly
4. Check for any errors in the application server code
