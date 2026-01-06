import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          "antd-vendor": ["antd", "@ant-design/icons", "antd-img-crop"],

          "tiptap-vendor": [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-image",
            "@tiptap/extension-link",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-text-align",
            "@tiptap/extension-text-style",
            "@tiptap/extension-underline",
            "@tiptap/extension-youtube",
            "reactjs-tiptap-editor",
          ],

          "query-vendor": ["@tanstack/react-query", "axios"],

          "utils-vendor": ["lodash", "clsx", "tailwind-merge", "uuid"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
