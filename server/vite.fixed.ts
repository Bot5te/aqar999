import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
// تغيير طريقة استيراد ملف التكوين لتكون متوافقة مع بيئة Render
const viteConfig = require(path.resolve(__dirname, "../vite.config.js"));
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}]`, message);
}

export async function setupVite(app: Express, server: Server) {
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    ...viteConfig,
    clearScreen: false,
    appType: "custom",
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Check if the request accepts HTML
      if (!req.headers.accept?.includes("text/html")) {
        return next();
      }

      // Skip API routes
      if (url.startsWith("/api")) {
        return next();
      }

      // Read index.html
      let template = await fs.promises.readFile(
        path.resolve(viteConfig.root, "index.html"),
        "utf-8"
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Send transformed HTML
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      const error = e as Error;
      // Log the error to both Vite and console
      viteLogger.error(error.stack || error.message);
      console.error(error.stack);
      next(error);
    }
  });

  return vite;
}

export function serveStatic(app: Express) {
  const publicDir = path.resolve(__dirname, "public");
  if (fs.existsSync(publicDir)) {
    // Add a unique query parameter to client-side scripts to prevent caching
    app.use(
      express.static(publicDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".js")) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=0, must-revalidate"
            );
          }
        },
      })
    );
  }
}