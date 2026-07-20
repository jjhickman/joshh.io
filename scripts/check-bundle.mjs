import { createReadStream, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createGzip } from "node:zlib";

const limits = { ".js": 160 * 1024, ".css": 30 * 1024 };
const assetsDirectory = new URL("../dist/assets/", import.meta.url);

if (!existsSync(assetsDirectory)) {
  throw new Error("dist/assets does not exist; run npm run build first");
}

const gzipSize = (filePath) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const gzip = createGzip();
    createReadStream(filePath)
      .on("error", reject)
      .pipe(gzip)
      .on("data", (chunk) => {
        size += chunk.length;
      })
      .on("error", reject)
      .on("end", () => resolve(size));
  });

for (const extension of Object.keys(limits)) {
  const files = readdirSync(assetsDirectory).filter((file) => file.endsWith(extension));
  const sizes = await Promise.all(
    files.map(async (file) => ({ file, size: await gzipSize(join(assetsDirectory.pathname, file)) })),
  );
  const total = sizes.reduce((sum, item) => sum + item.size, 0);
  const limit = limits[extension];
  process.stdout.write(`${extension.slice(1).toUpperCase()}: ${(total / 1024).toFixed(1)} KiB gzip / ${limit / 1024} KiB\n`);
  if (total > limit) {
    throw new Error(`${extension} bundle exceeds its gzip budget`);
  }
}
