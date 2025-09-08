# Cloud Run Deployment Guide

## Current Issue
Your app is failing with `exit(1)` because it cannot connect to the database at `35.239.240.172:5432` from Cloud Run.

## Solution Options

### Option 1: Use Cloud SQL (Recommended)
1. Create a Cloud SQL PostgreSQL instance in Google Cloud
2. Set up your database schema there
3. Use Cloud SQL's private IP or connection string

### Option 2: Configure Current Database for Cloud Run Access
If you want to keep using your current database:
1. Ensure your database server at `35.239.240.172` allows connections from Google Cloud Run IPs
2. Configure firewall rules to allow Cloud Run traffic

### Option 3: Quick Test - Skip Database Connection
For testing deployment only, temporarily modify the app to skip database connection.

## Required Cloud Run Environment Variables

Set these in Cloud Run console:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@your-cloud-sql-host:5432/arabai
JWT_SECRET=your-secure-production-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
```

## Current Changes Made
1. ✅ Fixed port binding to `0.0.0.0:8080`
2. ✅ Added better error logging
3. ✅ Created `.dockerignore` to prevent local env conflicts
4. ✅ Improved environment variable handling

## Next Steps
1. Push these changes to GitHub
2. Set up Cloud SQL or fix database connectivity
3. Configure environment variables in Cloud Run
4. Redeploy

## Testing Locally
Your app should still work locally with:
```bash
npm start
```