# Google OAuth Integration Guide for Frontend Developer

## Overview
Implement Google OAuth authentication in the frontend that integrates with our backend API. Users should be able to sign in with their Google account and receive JWT tokens for accessing protected endpoints.

## API Integration Details

### Backend Endpoint
```
POST /api/auth/google
Content-Type: application/json

Request Body:
{
  "googleIdToken": "GOOGLE_ID_TOKEN_FROM_GOOGLE"
}
```

### Expected Responses

**Success (200):**
```json
{
  "success": true,
  "message": "Google Auth successful",
  "data": {
    "user": { "id": 1, "name": "User Name", "email": "user@gmail.com", ... },
    "token": "JWT_ACCESS_TOKEN",
    "refreshToken": "REFRESH_TOKEN"
  }
}
```

**Error Cases:**
- **400**: Missing Google ID token
- **401**: Invalid Google token
- **409**: Email already exists (user should use email/password login)

## Frontend Requirements

### 1. Environment Setup
- Add Google Client ID to environment variables: `825528766846-gbq9m05amb2rdbdk5pv9bvp89b4fgqtf.apps.googleusercontent.com`
- Configure for both development and production environments

### 2. Google Authentication Integration
- Install Google authentication library (e.g., `vue3-google-login` or use Google's JavaScript SDK)
- Load Google's Sign-In JavaScript library: `https://accounts.google.com/gsi/client`
- Implement Google Sign-In button component

### 3. Authentication Flow Implementation

**Step 1: Google Sign-In**
- Create a "Sign in with Google" button
- Configure with the provided Google Client ID
- Handle Google's callback to receive the ID token

**Step 2: Send Token to Backend**
- When Google returns the ID token, send it to `/api/auth/google`
- Handle the response and extract JWT tokens

**Step 3: Token Management**
- Store the received JWT access token and refresh token securely
- Use the access token for authenticated API requests
- Implement token refresh logic when tokens expire

### 4. User Interface Components

**Login Page:**
- Include both email/password login form AND Google Sign-In button
- Add "or" divider between the two login methods
- Handle error messages appropriately

**Google Login Button:**
- Use Google's standard button design
- Show loading state during authentication
- Display appropriate error messages for failed authentication

### 5. State Management
- Create authentication state management (user data, login status)
- Implement logout functionality that clears tokens and redirects to login
- Persist authentication state across browser sessions

### 6. Route Protection
- Create authentication middleware for protected routes
- Redirect unauthenticated users to login page
- Automatically redirect authenticated users away from login page

### 7. API Integration
- Add authentication headers to all protected API requests
- Handle 401 responses (token expiration) by redirecting to login
- Implement automatic token refresh when possible

## Error Handling Requirements

1. **Invalid Google Token (401):**
   - Show error message: "Google authentication failed. Please try again."
   - Allow user to retry

2. **Email Already Exists (409):**
   - Show message: "An account with this email already exists. Please use email/password login."
   - Redirect to email login form or highlight it

3. **Network Errors:**
   - Show generic error message
   - Provide retry option

## Technical Specifications

### Authentication Headers
All protected API requests must include:
```
Authorization: Bearer JWT_ACCESS_TOKEN
```

### Token Storage
- Store tokens securely (consider httpOnly cookies for production)
- Implement proper token expiration handling
- Clear tokens on logout

### Browser Compatibility
- Ensure Google Sign-In works on all supported browsers
- Test on mobile devices

## Testing Checklist

1. **Google Sign-In Flow:**
   - [ ] Button appears and is clickable
   - [ ] Google popup/redirect works
   - [ ] Successfully receives ID token from Google
   - [ ] Backend API call succeeds
   - [ ] JWT tokens are stored properly
   - [ ] User is redirected to dashboard/main app

2. **Error Scenarios:**
   - [ ] Handle invalid Google tokens
   - [ ] Handle email already exists case
   - [ ] Handle network errors
   - [ ] Handle backend API errors

3. **Token Management:**
   - [ ] Tokens are included in API requests
   - [ ] Token expiration is handled
   - [ ] Logout clears tokens properly
   - [ ] Refresh token functionality works

4. **Route Protection:**
   - [ ] Unauthenticated users redirected to login
   - [ ] Authenticated users can access protected routes
   - [ ] Auth state persists on page refresh

## Important Notes

1. **Google Client ID**: Use exactly this ID - `825528766846-gbq9m05amb2rdbdk5pv9bvp89b4fgqtf.apps.googleusercontent.com`

2. **Backend Compatibility**: The backend expects the Google ID token in the `googleIdToken` field

3. **CORS**: Backend is configured for `localhost:3000`. If using different port, inform backend team

4. **Security**: Never expose Google Client Secret in frontend code (only Client ID is needed)

5. **UX**: Provide clear feedback during authentication process and helpful error messages

## Development Priority

1. **Phase 1**: Basic Google Sign-In integration
2. **Phase 2**: Token management and API integration  
3. **Phase 3**: Route protection and state persistence
4. **Phase 4**: Error handling and UX improvements

The backend API is fully implemented and tested. Focus on the frontend Google authentication flow and proper token management.