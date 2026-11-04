import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base allows publishing under any GitHub Pages project repository name.
export default defineConfig({ plugins: [react()], base: "./", build: { outDir: "docs", emptyOutDir: true } });
