import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    // Nitro produces the deployable server output. On Vercel it is auto-detected
    // and emits the Build Output API (`.vercel/output`); locally it builds the
    // default node-server preset into `.output/`.
    nitro(),
    react(),
  ],
});
