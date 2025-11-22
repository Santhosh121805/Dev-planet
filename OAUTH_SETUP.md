# Planet Code Forge - OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for Planet Code Forge.

## Prerequisites

1. **Google Developer Account**: You need a Google account to access the Google Developers Console
2. **GitHub Account**: You need a GitHub account to create OAuth apps
3. **Running Application**: Backend on http://localhost:8000 and Frontend on http://localhost:8087

## Setup Instructions

### 1. Google OAuth Setup

#### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Planet Code Forge")
4. Click "Create"

#### Step 2: Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google OAuth2 API"

#### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - **App name**: Planet Code Forge
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes: `openid`, `email`, `profile`
5. Save and continue

#### Step 4: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Set authorized redirect URIs:
   - `http://localhost:8087/`
   - `http://localhost:8087/auth/callback`
5. Copy your **Client ID** and **Client Secret**

### 2. GitHub OAuth Setup

#### Step 1: Create a GitHub OAuth App
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the application details:
   - **Application name**: Planet Code Forge
   - **Homepage URL**: `http://localhost:8087`
   - **Authorization callback URL**: `http://localhost:8087/`
4. Click "Register application"

#### Step 2: Get Client Credentials
1. After creation, you'll see your **Client ID**
2. Click "Generate a new client secret" to get your **Client Secret**
3. Copy both values

### 3. Configure Environment Variables

#### Backend Configuration
Edit `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# OAuth Redirect URL
OAUTH_REDIRECT_URL=http://localhost:8087
```

#### Frontend Configuration
Edit `.env` file in the root directory:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### 4. Restart Services

After updating the environment variables:

1. Stop the backend (Ctrl+C) and restart:
   ```bash
   cd backend
   python main.py
   ```

2. Stop the frontend (Ctrl+C) and restart:
   ```bash
   npm run dev
   ```

## Testing Authentication

1. Open http://localhost:8087 in your browser
2. Click "Enter Orbit" to open the login modal
3. Try "Continue with Google" or "Continue with GitHub"
4. You should be redirected to the OAuth provider
5. After authorization, you'll be redirected back to the app
6. Check the navigation bar for your profile information

## Troubleshooting

### Common Issues

1. **Invalid Client Error**
   - Verify your Client ID and Client Secret are correct
   - Check that redirect URIs match exactly

2. **Redirect URI Mismatch**
   - Ensure your OAuth app's redirect URI is set to `http://localhost:8087/`
   - Check that OAUTH_REDIRECT_URL in backend/.env matches

3. **CORS Issues**
   - The backend is configured to allow requests from the frontend
   - If issues persist, check the browser's developer console

4. **Port Conflicts**
   - Backend must run on port 8000
   - Frontend should run on port 8087
   - Update OAuth redirect URIs if ports change

### Development vs Production

For production deployment:
1. Update OAuth app settings with your production domain
2. Set production URLs in environment variables
3. Use HTTPS for production OAuth redirects

## Security Notes

- Never commit real OAuth credentials to version control
- Use different OAuth apps for development and production
- Keep client secrets secure and rotate them periodically
- Consider implementing additional security measures like PKCE for OAuth

## Support

If you encounter issues:
1. Check the browser's developer console for errors
2. Check backend logs for authentication errors
3. Verify OAuth app configurations match the setup instructions
4. Ensure environment variables are set correctly