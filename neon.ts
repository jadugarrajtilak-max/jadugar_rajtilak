import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Live-site services for Jadugar Rajtilak (production branch).
  // Postgres is the app's database (Prisma) — already wired via
  // DATABASE_URL. Auth is declared for future admin accounts; the
  // site currently uses the HMAC master-admin token issued by
  // POST /api/admin/login.
  auth: true,
  aiGateway: true,
  functions: {
    hello: { name: "Hello World", source: "./hello.ts" },
  },
  buckets: {
    // Website images (hero, gallery, service cards) are read by every
    // visitor's browser anonymously — public_read lets the branch S3
    // endpoint serve them directly and be CDN-cached forever.
    assets: { access: "public_read" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
