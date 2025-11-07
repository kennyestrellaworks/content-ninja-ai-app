import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/flux": {
        target: "https://nihalgazi-flux-unlimited.hf.space",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flux/, ""),
        secure: false,
      },
    },
  },
});
