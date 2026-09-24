declare namespace Cloudflare {
  interface Env {
    DATABASE_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    BUCKET?: R2Bucket;
  }
}
