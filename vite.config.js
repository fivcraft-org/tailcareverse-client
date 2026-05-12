import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@theme": path.resolve(__dirname, "./src/theme"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("@mantine")) {
              return "vendor-mantine";
            }
            if (
              id.includes("framer-motion") ||
              id.includes("lucide-react") ||
              id.includes("react-icons") ||
              id.includes("react-easy-crop")
            ) {
              return "vendor-ui";
            }
            if (id.includes("axios") || id.includes("socket.io-client")) {
              return "vendor-utils";
            }
          }

          if (id.includes("src/api/api-admin.js") || id.includes("src/pages/admin/AdminDashboard.jsx")) {
            return "admin-core";
          }

          if (id.includes("src/pages/admin/")) {
            return "admin-features";
          }
          
          if (
            id.includes("src/pages/auth/") ||
            id.includes("src/pages/Home") ||
            id.includes("src/pages/Explore") ||
            id.includes("src/pages/Profile") ||
            id.includes("src/pages/EditProfile") ||
            id.includes("src/pages/Chat") ||
            id.includes("src/pages/AIAssistant") ||
            id.includes("src/pages/Notifications")
          ) {
            return "feature-social";
          }

          if (
            id.includes("src/pages/Marketplace") ||
            id.includes("CreateListing") ||
            id.includes("EditListing") ||
            id.includes("ListingDetail") ||
            id.includes("MyListings")
          ) {
            return "feature-marketplace";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
