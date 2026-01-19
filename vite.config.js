import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/sop-api": {
        // target: "http://14.103.223.101:6007",
        target: "http://153.35.82.12:6007", // 四会
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/sop-api/, ""),
        secure: false,
      },
      "/chatapi": {
        target: "http://14.103.223.101:9010",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatapi/, ""),
      },
      "/companyapi": {
        // target: "http://14.103.223.101:8010",
        target: "http://153.35.82.12:8010", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/companyapi/, ""),
      },
      "/chathistoryapi": {
        target: "http://14.103.223.101:6022",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chathistoryapi/, ""),
      },
      "/userapi": {
        // target: "http://14.103.223.101:9011",
        target: "http://153.35.82.12:30902", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/userapi/, ""),
      },
      "/mobileapi": {
        // target: "http://14.103.223.101:7010",
        target: "http://153.35.82.12:30701",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mobileapi/, ""),
      },
      "/videoapi": {
        target: "https://bin-practitioner-stated-sunrise.trycloudflare.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/videoapi/, ""),
      },
    },
  },
});
