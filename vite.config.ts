import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      tailwindcss(),
      basicSsl(),
      visualizer({
        filename: "./dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true, // 删除 console
          drop_debugger: true, // 删除 debugger
        },
        mangle: {
          toplevel: true, // 混淆顶级作用域
          safari10: true, // Safari 10 兼容
        },
        format: {
          comments: false, // 删除注释
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendors": ["react", "react-dom"],
            icons: ["lucide-react"],
          },
        },
      },
    },
  };
});
