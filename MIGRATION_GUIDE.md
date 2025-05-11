# Track Flow Courier - Railway Migration Guide

This guide outlines the steps taken to migrate the Track Flow Courier application from using mock data to a real PostgreSQL database hosted on Railway.

## Setup Steps

### 1. Create a Railway Account and Project

1. Sign up for a Railway account at [railway.app](https://railway.app/).
2. Create a new project called "trackflowdb".

### 2. Add PostgreSQL Database

1. Inside your Railway project, add a PostgreSQL database:
   ```
   railway add --database postgres
   ```
2. This will create a new PostgreSQL instance in your project.

### 3. Add a Service for the Application

1. Create a new service for the application:
   ```
   railway add --service track-flow-courier
   ```
2. This creates a new service that will host our application.

### 4. Setup Environment Variables

1. The PostgreSQL connection information is automatically set up as environment variables in your Railway project.
2. Make sure to capture the following variables in your `.env` file:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@centerbeam.proxy.rlwy.net:PORT/railway
   ```

### 5. Database Migration

1. Create a migration script (`server/db/runMigrations.js`) to initialize the database schema:
   ```javascript
   // Run PostgreSQL migrations using the pg client
   const fs = require('fs');
   const path = require('path');
   const { Pool } = require('pg');
   require('dotenv').config();

   async function runMigrations() {
     console.log('Starting database migrations...');

     // Create a connection pool
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       ssl: {
         rejectUnauthorized: false // Required for Railway's PostgreSQL
       }
     });

     try {
       // Read the migrations SQL file
       const migrationsPath = path.join(__dirname, 'migrations.sql');
       const migrationsSql = fs.readFileSync(migrationsPath, 'utf8');

       console.log('Connecting to database...');
       
       // Get a client from the pool
       const client = await pool.connect();
       
       try {
         console.log('Connected. Running migrations...');
         
         // Start a transaction
         await client.query('BEGIN');
         
         // Run the migrations
         await client.query(migrationsSql);
         
         // Commit the transaction
         await client.query('COMMIT');
         
         console.log('Migrations completed successfully!');
       } catch (err) {
         // Rollback the transaction in case of error
         await client.query('ROLLBACK');
         console.error('Error running migrations:', err);
         throw err;
       } finally {
         // Release the client back to the pool
         client.release();
       }
     } catch (err) {
       console.error('Database migration failed:', err);
       throw err;
     } finally {
       // Close the pool
       await pool.end();
     }
   }

   // Run the migrations
   runMigrations()
     .then(() => {
       console.log('Database setup complete.');
       process.exit(0);
     })
     .catch(err => {
       console.error('Failed to set up database:', err);
       process.exit(1);
     });
   ```

2. Run the migrations to initialize your database:
   ```
   node server/db/runMigrations.js
   ```

### 6. Code Changes

#### 1. Update Server DB Connection

Make sure `server/db/index.js` is configured to connect to the Railway PostgreSQL database:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from env variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for Railway's PostgreSQL
  } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect();
    // Implementation details...
    return client;
  }
};
```

#### 2. Create API Client for Frontend

Create a new API client (`src/lib/apiClient.ts`) for the frontend to communicate with the backend:

```typescript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// API function helpers for specific endpoints
// Auth, Couriers, Customers, Sender Addresses, Slips, Audit Logs

export default apiClient;
```

#### 3. Create API Data Context

Create a new React context (`src/contexts/ApiDataContext.tsx`) that leverages the API client to manage application data:

```typescript
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { 
  customersAPI, 
  couriersAPI, 
  slipsAPI, 
  senderAddressesAPI,
  auditLogsAPI
} from '../lib/apiClient';

// Context implementation with methods for CRUD operations
// on all data models (customers, couriers, slips, etc.)

// Custom hook to use the ApiDataContext
export const useApiData = () => {
  const context = useContext(ApiDataContext);
  if (!context) {
    throw new Error('useApiData must be used within an ApiDataProvider');
  }
  return context;
};
```

### 7. Deploy the Application

1. Deploy your application to Railway:
   ```
   railway up
   ```

2. Your application will now be available at the URL provided by Railway.

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Driver (pg)](https://node-postgres.com/)
