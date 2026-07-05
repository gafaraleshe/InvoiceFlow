// Vercel serverless function entry.
//
// The real server is bundled by `build:vercel` (esbuild) into
// dist/server/index.js — a single self-contained file with our path aliases
// resolved and all local modules inlined. This thin wrapper just re-exports it
// so Vercel's function builder has nothing to resolve except node_modules.
import app from "../dist/server/index.js";

export default app;
