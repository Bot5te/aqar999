#!/bin/bash
# سكريبت بناء مخصص لـ Render

# تثبيت التبعيات
npm install

# إصلاح مشكلة استيراد ملف vite.config
# 1. نسخ ملف التكوين الأصلي بعدة صيغ لضمان استيراده بشكل صحيح
cp vite.config.js vite.config.mjs
cp vite.config.js vite.config.ts

# نسخ نسخة CommonJS الموجودة أو إنشاء واحدة إذا لم تكن موجودة
if [ -f "vite.config.cjs" ]; then
  echo "وجدت ملف vite.config.cjs"
else
  echo "إنشاء ملف vite.config.cjs..."
  cat > vite.config.cjs << 'EOL'
// ESM to CommonJS conversion for compatibility with require()
const path = require('path');

// Import shadcn theme plugin for CommonJS
const themePlugin = require("@replit/vite-plugin-shadcn-theme-json").default;

const config = {
  plugins: [
    require('@vitejs/plugin-react')(),
    themePlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
};

module.exports = config;
EOL
fi

# 2. تعديل ملف vite.ts لاستخدام المسار الصحيح
mkdir -p dist
mkdir -p server-temp

# 3. استخدام الملف المعدل بدلاً من ملف vite.ts الأصلي
# نسخ الملف المعدل الذي أنشأناه مسبقاً (server/vite.fixed.ts)
if [ -f "server/vite.fixed.ts" ]; then
  echo "استخدام ملف vite.ts المعدل الموجود..."
  cp server/vite.fixed.ts server/vite.ts
else
  echo "إنشاء ملف vite.ts معدل..."
  cat > server/vite.ts << 'EOL'
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
EOL
fi

# 5. تنفيذ عملية البناء للواجهة الأمامية
npx vite build

# 6. بناء ملفات الخادم مع الإصلاحات
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 7. نسخ ملفات تكوين إضافية للتوزيع
cp -r shared dist/
cp -r attached_assets dist/ 2>/dev/null || true
cp vite.config.js dist/
cp vite.config.mjs dist/vite.config.js
cp vite.config.cjs dist/
# نسخ ملف theme.json للتأكد من أن الألوان ستظهر بشكل صحيح
cp theme.json dist/
# نسخ جميع صيغ vite.config إلى كل المجلدات المحتملة للتأكد من أن الاستيراد سيعمل
mkdir -p dist/server
cp vite.config.js dist/server/
cp vite.config.cjs dist/server/
cp theme.json dist/server/

echo "تمت عملية البناء بنجاح!"