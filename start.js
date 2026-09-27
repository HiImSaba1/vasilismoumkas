const { existsSync } = require("node:fs");
const { resolve } = require("node:path");

// Plesk launches this custom server directly instead of through `next start`.
// Load the private production environment before Next.js or application modules
// read process.env. Node does not overwrite variables already supplied by Plesk.
const productionEnvironmentPath = resolve(__dirname, ".env.production.local");
if (existsSync(productionEnvironmentPath)) {
  if (typeof process.loadEnvFile !== "function") {
    throw new Error("Node.js 20.12 or newer is required to load .env.production.local.");
  }
  process.loadEnvFile(productionEnvironmentPath);
}

process.env.NODE_ENV = "production";
process.env.HOSTNAME ||= "0.0.0.0";

const standaloneServerPath = resolve(__dirname, ".next", "standalone", "server.js");
if (!existsSync(standaloneServerPath)) {
  throw new Error(
    "The standalone runtime is missing. Deploy the verified Linux release before restarting the application.",
  );
}

// The generated standalone server owns HTTP startup and graceful shutdown.
// Keep this wrapper free of the former full-framework bootstrap path.
require(standaloneServerPath);
