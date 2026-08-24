import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const PROJECT_ROOT = import.meta.dirname;
const CLIENT_ROOT = path.resolve(PROJECT_ROOT, "client");
const STATIC_ASSETS_ROOT = path.resolve(PROJECT_ROOT, "static-assets");
const HTACCESS_FILE = path.resolve(PROJECT_ROOT, "hostinger", ".htaccess");
const ASSET_PREFIX = "/manus-storage/";
const STATIC_PREFIX = "/media/";

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function walkFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function isSafeAssetPath(requestPath: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(requestPath) &&
    !requestPath.includes("..") &&
    path.posix.normalize(requestPath) === requestPath;
}

function hostingerStaticAssets(): Plugin {
  return {
    name: "hostinger-static-assets",
    transform(code, id) {
      if (!id.startsWith(CLIENT_ROOT) || !/\.(?:ts|tsx|js|jsx)$/.test(id)) return null;
      return code.includes(ASSET_PREFIX) ? code.replaceAll(ASSET_PREFIX, STATIC_PREFIX) : null;
    },
    transformIndexHtml(html) {
      return html.replaceAll(ASSET_PREFIX, STATIC_PREFIX);
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/media", (req, res, next) => {
        const requestPath = decodeURIComponent((req.url || "").split("?")[0]).replace(/^\//, "");
        if (!requestPath) return next();
        if (!isSafeAssetPath(requestPath)) {
          res.statusCode = 400;
          res.end("Invalid asset path");
          return;
        }

        const assetPath = path.join(STATIC_ASSETS_ROOT, requestPath);
        if (!assetPath.startsWith(`${STATIC_ASSETS_ROOT}${path.sep}`) || !existsSync(assetPath) || !statSync(assetPath).isFile()) {
          return next();
        }

        res.setHeader("Content-Type", mimeTypes[path.extname(assetPath).toLowerCase()] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(readFileSync(assetPath));
      });
    },
    generateBundle() {
      if (!existsSync(STATIC_ASSETS_ROOT)) {
        throw new Error("Static assets are missing. Run the asset preparation script before building.");
      }

      for (const file of walkFiles(STATIC_ASSETS_ROOT)) {
        const relativePath = path.relative(STATIC_ASSETS_ROOT, file).split(path.sep).join("/");
        if (relativePath === "manifest.json") continue;
        this.emitFile({ type: "asset", fileName: `media/${relativePath}`, source: readFileSync(file) });
      }

      this.emitFile({ type: "asset", fileName: ".htaccess", source: readFileSync(HTACCESS_FILE) });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), hostingerStaticAssets()],
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
    },
  },
  root: CLIENT_ROOT,
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: [".manuspre.computer", ".manus.computer", ".manus-asia.computer", ".manuscomputer.ai", ".manusvm.computer", "localhost", "127.0.0.1"],
    fs: {
      allow: [PROJECT_ROOT],
      strict: true,
      deny: ["**/.*"],
    },
  },
});
