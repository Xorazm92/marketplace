// auth.constants.ts

export const BCRYPT_SALT = 7;
export const COOKIE_MAX_AGE = Number(process.env.COOKIE_TIME) || 7 * 24 * 60 * 60 * 1000; // default 7 days
export const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || "default_refresh_key";
