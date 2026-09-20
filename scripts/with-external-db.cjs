const { spawnSync } = require("node:child_process");
require("dotenv").config();

if (!process.env.DIRECT_DATABASE_URL) {
  console.error("DIRECT_DATABASE_URL is required for the external database workflow.");
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, process.argv.slice(2), {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: process.env.DIRECT_DATABASE_URL },
});
process.exit(result.status ?? 1);
