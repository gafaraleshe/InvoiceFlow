import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    // The suite runs without a database on purpose: the REST tests assert that a
    // valid request gets all the way to the data layer and only fails there.
    // server/db/client.ts loads .env (so standalone scripts work), which would
    // otherwise hand the tests a developer's real database — and some of them
    // POST. Blanking these keeps the run hermetic; dotenv does not override a
    // variable that is already set, even to "".
    env: {
      DATABASE_URL: "",
      POSTGRES_URL: "",
      POSTGRES_PRISMA_URL: "",
    },
  },
});
