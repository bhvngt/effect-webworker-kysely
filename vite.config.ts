import { svelte } from "@sveltejs/vite-plugin-svelte";
import { ServerResponse } from "node:http";
import { Connect, defineConfig, PreviewServer, ViteDevServer } from "vite";

function crossOriginIsolationMiddleware(_: Connect.IncomingMessage, response: ServerResponse,
                                        next: Connect.NextFunction) {
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
}

const crossOriginIsolation = {
  name: "cross-origin-isolation",
  configureServer: (server: ViteDevServer) => {
    server.middlewares.use(crossOriginIsolationMiddleware);
  },
  configurePreviewServer: (server: PreviewServer) => {
    server.middlewares.use(crossOriginIsolationMiddleware);
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), crossOriginIsolation],
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
});
