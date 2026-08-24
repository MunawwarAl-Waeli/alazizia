import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const baseUrl = process.argv[2] || "http://127.0.0.1:8090";
const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const distRoot = path.join(projectRoot, "dist");
const services = JSON.parse(readFileSync(path.join(distRoot, "media", "services-data_71caf2b0.json"), "utf8"));
const routes = ["/", "/about", "/services", "/gallery", "/sitemap", ...services.map((service) => `/services/${service.slug}`)];
const publicFiles = ["/robots.txt", "/sitemap.xml", "/media/services-data_71caf2b0.json"];

async function verifyRoute(route) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  const body = await response.text();
  if (response.status !== 200 || !body.includes("<div id=\"root\"></div>")) {
    throw new Error(`Route failed: ${route} (HTTP ${response.status})`);
  }
}

async function verifyFile(file) {
  const response = await fetch(`${baseUrl}${file}`, { redirect: "manual" });
  if (response.status !== 200) throw new Error(`Static file failed: ${file} (HTTP ${response.status})`);
}

const mediaDirectory = path.join(distRoot, "media");
const mediaFiles = readdirSync(mediaDirectory).filter((file) => file !== "manifest.json");
const missingMedia = mediaFiles.filter((file) => !existsSync(path.join(mediaDirectory, file)));
if (missingMedia.length) throw new Error(`Missing emitted media: ${missingMedia.join(", ")}`);

for (const route of routes) await verifyRoute(route);
for (const file of publicFiles) await verifyFile(file);

console.log(JSON.stringify({
  baseUrl,
  routeCount: routes.length,
  staticFileCount: publicFiles.length,
  mediaFileCount: mediaFiles.length,
  status: "passed",
}, null, 2));
