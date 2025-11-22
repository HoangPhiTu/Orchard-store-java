import { jwtVerify, decodeJwt } from "jose";

/**
 * JWT Payload structure from backend
 */
export interface JWTPayload {
  sub: string; // email
  userId: number;
  roles: string[]; // e.g., ["ROLE_ADMIN", "ROLE_STAFF"]
  authorities?: string[]; // e.g., ["product:view", "product:create"]
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (faster, less secure)
 * Use this when you only need to read the payload quickly
 */
export function decodeTokenUnsafe(token: string): JWTPayload | null {
  try {
    const decoded = decodeJwt(token);
    return decoded as unknown as JWTPayload;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

/**
 * Verify and decode JWT token with secret (more secure)
 * Use this when you have JWT secret available
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("Failed to verify JWT token:", error);
    return null;
  }
}

/**
 * Extract roles from JWT payload
 */
export function extractRoles(payload: JWTPayload | null): string[] {
  if (!payload || !payload.roles) {
    return [];
  }
  return payload.roles;
}

/**
 * Check if user has admin or staff role
 */
export function hasAdminOrStaffRole(roles: string[]): boolean {
  return roles.some(
    (role) =>
      role === "ROLE_ADMIN" ||
      role === "ADMIN" ||
      role === "ROLE_STAFF" ||
      role === "STAFF"
  );
}

/**
 * Check if user is customer only
 */
export function isCustomerOnly(roles: string[]): boolean {
  const hasAdminOrStaff = hasAdminOrStaffRole(roles);
  const hasCustomer = roles.some(
    (role) => role === "ROLE_CUSTOMER" || role === "CUSTOMER"
  );
  // If has customer role but no admin/staff, it's customer only
  return hasCustomer && !hasAdminOrStaff;
}
