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