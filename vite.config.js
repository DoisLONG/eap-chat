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
        target: "http://14.103.176.8:6007",
        // target: "http://14.103.144.187:30114", // 四会
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/sop-api/, ""),
        secure: false,
      },
      "/chatapi": {
        target: "http://14.103.176.8:9010",
        // target: "http://14.103.144.187:30116", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatapi/, ""),
      },
      "/companyapi": {
        target: "http://14.103.176.8:8010",
        // target: "http://14.103.144.187:30117", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/companyapi/, ""),
      },
      "/chathistoryapi": {
        target: "http://14.103.176.8:6022",
        // target: "http://14.103.144.187:30113", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chathistoryapi/, ""),
      },
      "/userapi": {
        target: "http://14.103.176.8:9011",
        // target: "http://14.103.144.187:30112", // 四会
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/userapi/, ""),
      },
      "/mobileapi": {
        target: "http://14.103.176.8:7010",
        // target: "http://14.103.144.187:30115",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mobileapi/, ""),
      },
      "/dashboardapi": {
        target: "http://14.103.176.8:6020",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dashboardapi/, ""),
      },
      "/videoapi": {
        // http://14.103.176.8:8000/docs        asr_service
        // http://14.103.176.8:8001/docs        excel_service
        // target: "https://bin-practitioner-stated-sunrise.trycloudflare.com",
        target: "http://14.103.176.8:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/videoapi/, ""),
      },
      "/videoapiv2": {
        target: "http://14.103.176.8:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/videoapiv2/, ""),
      },
    },
  },
});
