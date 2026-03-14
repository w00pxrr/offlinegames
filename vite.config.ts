import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: "index.html",
        gameEmbed: "games/g/gameEmbed.html",
      },
    },
  },
});
