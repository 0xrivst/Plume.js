/**
 * Copyright (c) 2025 rivst
 * SPDX-License-Identifier: MIT
 */

import { scanRoutes } from "./scanner.js";
import { serveStatic } from "./static.js";

export function createPlume(options = {}) {
  const {
    routesDir = "./src/routes",
    staticDir = "./src/static",
    port = 3000,
    development = true,
  } = options;

  const routeManifest = scanRoutes(routesDir);
  const routes = {};

  for (const routeInfo of routeManifest) {
    const { type, pattern } = routeInfo;

    if (type === "server") {
      routes[pattern] = createApiHandlers(routeInfo);
    } else {
      routes[pattern] = createPageHandler(routeInfo);
    }
  }

  console.log(routes);

  const server = Bun.serve({
    port,
    routes,
    development,
    async fetch(request) {
      const url = new URL(request.url);
      if (request.method === "GET") {
        const staticResponse = await serveStatic(url.pathname, staticDir);
        if (staticResponse) {
          return staticResponse;
        }
      }
      return new Response("Not Found", { status: 404 });
    },
  });

  return server;
}

function createPageHandler(routeInfo) {
  const module = require(routeInfo.filePath);
  return module.default || module;
}

function createApiHandlers(routeInfo) {
  return async (req) => {
    try {
      const module = await import(routeInfo.filePath);
      const method = req.method;

      if (!module[method]) {
        return new Response(`Method ${method} Not Allowed`, { status: 405 });
      }

      return await module[method](req);
    } catch (error) {
      console.error(`API route error (${req.method}):`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  };
}
