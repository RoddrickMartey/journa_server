import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Request } from "express";
import { AppError } from "../errors/appError";
import "dotenv/config";

/**
 * JWT payload union.
 * Represents an authenticated identity.
 */
type JwtPayload = { id: string; role: "USER" } | { id: string; role: "ADMIN" };

/**
 * JWT service responsible for:
 * - Signing tokens
 * - Verifying tokens
 * - Attaching authenticated identity to the request object
 *
 * This service handles authentication only.
 * Authorization is handled by middleware.
 */
class JwtService {
  /**
   * Secret used to sign and verify JWT tokens.
   */
  private readonly secret: Secret;

  /**
   * Token expiration time.
   */
  private readonly expiresIn: SignOptions["expiresIn"];

  /**
   * Initializes the JWT service.
   * Reads configuration from environment variables.
   */
  constructor() {
    this.secret = process.env.JWT_SECRET as string;
    this.expiresIn = "4d" as unknown as SignOptions["expiresIn"];
  }

  /**
   * Signs and returns a JWT token.
   *
   * @param payload - Authenticated user or admin payload
   * @returns Signed JWT token as a string
   */
  sign(payload: JwtPayload, admin: boolean = false): string {
    if (admin) {
      const options: SignOptions = { expiresIn: "14h" };
      return jwt.sign(payload as object, this.secret, options);
    }
    const options: SignOptions = { expiresIn: this.expiresIn };
    return jwt.sign(payload as object, this.secret, options);
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param token - JWT token string
   * @returns Decoded JWT payload
   * @throws AppError when token is invalid or expired
   */
  verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new AppError("Token is invalid or expired", 401, { logout: true });
    }
  }

  /**
   * Attaches the authenticated identity to the Express request object.
   *
   * Reads the token from cookies and populates `req.auth`.
   *
   * @param req - Express request object
   * @throws AppError when token is missing or invalid
   */
  attach(req: Request): void {
    const token = req.cookies.token;

    if (!token) {
      throw new AppError("No token provided", 401, { logout: true });
    }

    req.auth = this.verify(token);
  }
}

export const jwtService = new JwtService();
