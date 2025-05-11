# Railway Deployment Guide

This guide provides detailed instructions for deploying the Track Flow Courier application to Railway.app.

## 1. Setting Up a Railway Account

1. Sign up for a Railway account at [railway.app](https://railway.app/)
2. Install the Railway CLI (optional but helpful):
   ```bash
   npm install -g @railway/cli
   ```
3. Login to the Railway CLI:
   ```bash
   railway login
   ```

## 2. Creating a New Project

1. Go to the Railway dashboard and click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account if not already connected
4. Select the repository containing your Track Flow Courier application
5. Railway will automatically detect your package.json and set up the project

## 3. Setting Up PostgreSQL Database

1. From your project dashboard, click "New Service" → "Database" → "PostgreSQL"
2. Wait for the database to be provisioned
3. Click on the PostgreSQL service to view its details
4. Go to the "Data" tab to access the SQL editor
5. Copy the SQL from `server/db/migrations.sql` and paste it into the SQL editor
6. Click "Run" to execute the migrations and set up your database schema

## 4. Configuring Environment Variables

1. In your project dashboard, click on the "Variables" tab
2. Add the following environment variables:

```
DATABASE_URL=<Railway will automatically provide this>
JWT_SECRET=<generate a secure random string for production>
NODE_ENV=production
```

3. For the frontend service, add:
```
VITE_API_URL=<your-backend-api-url>
```
   Note: This will be `https://<your-project-name>-production.up.railway.app/api`

## 5. Setting Up the Project for Railway

We've already prepared the project for Railway deployment with:

1. Added server-side code in `server/index.js` to handle API requests
2. Updated the Supabase client to use the backend API
3. Added JWT authentication handling
4. Modified package.json to include the required dependencies and scripts

## 6. Deploying to Railway

1. Push all changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push
   ```

2. Railway will automatically detect the changes and start the deployment process
3. You can monitor the deployment in the Railway dashboard

## 7. Verifying the Deployment

1. Once deployed, Railway will provide a URL for your application
2. Open the URL in your browser to verify the deployment was successful
3. Try logging in with the demo credentials:
   - Username: admin
   - Password: (any password will work in the initial setup as we're not checking passwords)

## 8. Common Issues and Troubleshooting

### Connection Issues
If the frontend cannot connect to the backend, verify:
- The `VITE_API_URL` environment variable is set correctly
- The backend service is running correctly
- CORS is properly configured in the backend

### Database Issues
If you encounter database errors:
- Verify the migrations ran successfully
- Check that the `DATABASE_URL` is being properly used
- Ensure the PostgreSQL service is running

### Authorization Issues
If authentication is not working:
- Check that the `JWT_SECRET` is properly set
- Ensure the token is being passed properly in the Authorization header
- Verify the token verification logic in the backend

## 9. Local Development After Railway Setup

For local development, you can use the following commands:

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Start the backend development server:
   ```bash
   npm run dev:server
   ```

3. Or start both concurrently:
   ```bash
   npm run dev:all
   ```

Make sure your `.env` file contains the appropriate local development values.

## 10. Next Steps

After successful deployment, consider:

1. Setting up proper password hashing in the login endpoint
2. Implementing more robust error handling
3. Adding additional API endpoints for all required functionality
4. Setting up automated backups for your PostgreSQL database
5. Configuring a custom domain for your application
