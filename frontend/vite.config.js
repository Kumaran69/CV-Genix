import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set the port
    host: true, // Allow external access
    open: true, // Auto open browser
  },
  build: {
    outDir: "dist",
  },
});