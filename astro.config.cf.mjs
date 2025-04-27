// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
// import vercel from "@astrojs/vercel/serverless";
// import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  // adapter: vercel({}),
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  experimental: {
    session: true,
  },
  integrations: [
    react({
      include: ["**/*.tsx", "**/*.jsx"],
      // @ts-expect-error - not in types but is a valid option
      renderHydrationScript: false,
    }),
    sitemap(),
  ],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    define: {
      "process.env.CLOUDFLARE": JSON.stringify(true),
    },
    ssr: {
      external: ["react-dom/server", "react-dom/client"],
      noExternal: ["react-dom"],
    },
  },
});
