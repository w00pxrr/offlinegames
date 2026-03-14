/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const toCopy = ["games", "img", "assets"];

if (!fs.existsSync(dist)) {
  console.error("dist folder not found. Run Vite build first.");
  process.exit(1);
}

for (const dir of toCopy) {
  const src = path.join(root, dir);
  const dest = path.join(dist, dir);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, dest, { recursive: true });
}
