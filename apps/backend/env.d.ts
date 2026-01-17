declare module "bun" {
  interface Env {
    DATABASE_URL: string;
    FRONTEND_ORIGIN: string;
    JWT_SECRET_KEY: string;
    COOKIE_DOMAIN: string;
    REFRESH_TOKEN_COOKIE_NAME: string;
  }
}
