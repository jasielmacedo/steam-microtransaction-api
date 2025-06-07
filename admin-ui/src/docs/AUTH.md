# Authentication Implementation

This document explains the authentication implementation for the Steam Microtransaction API admin UI.

## JWT Token Storage and Validation

The application uses JWT (JSON Web Token) for authentication. Tokens are stored in localStorage for persistence between sessions.

### Token Storage

- JWT tokens are stored in `localStorage` using the key `microtrax_token`
- User data is stored in `localStorage` using the key `microtrax_user`

### Token Validation

The system includes several mechanisms to validate token authenticity and expiration:

1. **Token Expiration Check**
   - The `isTokenExpired` function in `authApi.ts` decodes the JWT and checks if it's expired
   - It includes a 60-second buffer to renew the token before it actually expires

2. **Request Interceptor**
   - Every API request includes the token in the Authorization header
   - Before making sensitive API calls, the system checks token validity

3. **Response Interceptor**
   - The response interceptor captures 401 (Unauthorized) errors
   - When a token is deemed invalid by the server, the client automatically logs the user out
   - It dispatches a custom event `auth:sessionExpired` to notify the AuthContext

4. **Token Refresh**
   - The system does not implement automatic token refresh
   - When a token expires, the user is redirected to the login page
   - Future enhancement: Implement silent token refresh

## Authentication Flow

1. **Login**
   - User enters credentials
   - Server validates and returns JWT token with user data
   - Client stores token and user data in localStorage

2. **Application Startup**
   - AuthContext checks for a token in localStorage
   - If a token exists, it verifies validity using `checkTokenValidity`
   - If valid, it fetches the current user data
   - If invalid or expired, it clears the token and shows login page

3. **API Requests**
   - Each request includes the token in the Authorization header
   - Before sensitive operations, the system checks token validity
   - If the token becomes invalid during a session, the user is logged out

4. **Logout**
   - Clears the token and user data from localStorage
   - Redirects to login page

## Security Considerations

1. **Token Storage**
   - localStorage is used for simplicity but is vulnerable to XSS attacks
   - Future enhancement: Consider using HttpOnly cookies for better security

2. **Token Validation**
   - Tokens are validated both client-side and server-side
   - The server has final authority on token validity

3. **Session Expiration**
   - Tokens expire after the time configured on the server
   - Users are automatically logged out when tokens expire

## References

- [JWT.io](https://jwt.io/) - For more information on JWT tokens
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)