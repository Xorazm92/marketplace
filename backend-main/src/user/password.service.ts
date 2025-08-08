// password.service.ts

import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { BCRYPT_SALT } from "../auth/auth.constants";

/**
 * Service responsible for password hashing and verification.
 * Centralises bcrypt usage to simplify testing and future algorithm changes.
 */
@Injectable()
export class PasswordService {
  /**
   * Hash a plain password using the configured salt rounds.
   */
  async encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT);
  }

  /**
   * Compare a plain password with a hashed password.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
