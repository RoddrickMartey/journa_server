import { hash, compare } from "bcrypt";
import { AppError } from "../errors/appError";

/**
 * Payload required to hash a plain-text password.
 */
type HashPasswordPayload = {
  password: string;
};

/**
 * Payload required to compare a plain-text password
 * with an existing hashed password.
 */
type ComparePasswordPayload = {
  password: string;
  hashedPassword: string;
};

/**
 * Service responsible for password hashing and comparison.
 * Encapsulates bcrypt usage to keep authentication logic consistent.
 */
class PasswordService {
  /**
   * Number of salt rounds used by bcrypt.
   * Higher values increase security but also computation cost.
   */
  private readonly saltRounds = 12;

  /**
   * Hash a plain-text password using bcrypt.
   *
   * @param payload - Object containing the plain-text password
   * @returns A bcrypt-hashed password string
   */
  async hashPassword(payload: HashPasswordPayload): Promise<string> {
    return hash(payload.password, this.saltRounds);
  }

  /**
   * Compare a plain-text password against a hashed password.
   *
   * @param payload - Object containing both plain and hashed passwords
   * @throws AppError when the password comparison fails
   * @returns true when the password matches
   */
  async comparePassword(payload: ComparePasswordPayload): Promise<boolean> {
    const isMatch = await compare(payload.password, payload.hashedPassword);

    if (!isMatch) {
      throw new AppError("Incorrect password", 403);
    }

    return true;
  }
}

/**
 * Singleton instance of PasswordService.
 * Reused across the application to avoid unnecessary instantiation.
 */
export const passwordService = new PasswordService();
