/**
 * Simple JWT decoder utility.
 * This provides basic JWT decoding functionality without external dependencies.
 */

/**
 * Decode a JWT token and return the payload.
 * @param token JWT token to decode
 * @returns The decoded JWT payload
 */
export function jwtDecode<T = any>(token: string): T {
  try {
    // Get the payload part (second part) of the JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the Base64URL-encoded payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Invalid token format');
  }
}

/**
 * Check if a JWT token is expired.
 * @param token JWT token to check
 * @param bufferSeconds Optional time buffer in seconds (default: 60)
 * @returns Boolean indicating if the token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Add a buffer to renew token before it actually expires
    return !decoded.exp || decoded.exp < currentTime + bufferSeconds;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}