import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, 'client', 'src', '$1'),
      },
      {
        find: /^@shared\/(.*)$/,
        replacement: path.resolve(__dirname, 'shared', '$1'),
      },
      {
        find: /^@assets\/(.*)$/,
        replacement: path.resolve(__dirname, 'attached_assets', '$1'),
      },
      // Add node_modules resolution
      {
        find: /^@radix-ui\/(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules/@radix-ui/$1'),
      },
      {
        find: /^@tanstack\/(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules/@tanstack/$1'),
      },
      {
        find: /^date-fns(\/.*)?$/,
        replacement: path.resolve(__dirname, 'node_modules/date-fns$1'),
      },
    ],
  },
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      allow: [
        // Allow serving files from the project root
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'client'),
      ],
    },
  },
});
