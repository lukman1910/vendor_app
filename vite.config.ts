import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Mengunci agar Vite selalu jalan di localhost:3000
    strictPort: true, // Jika port 3000 dipakai aplikasi lain, Vite akan memberi error alih-alih pindah port
  },
});
