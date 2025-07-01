/**
 * Copyright (c) 2025 rivst
 * SPDX-License-Identifier: MIT
 */

import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";

export function scanRoutes(routesDir) {
  const routes = [];
  const absoluteRoutesDir = resolve(routesDir);

  function scanDirectory(dir, routePath = "") {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        let newRoutePath = routePath;

        if (entry.startsWith("[") && entry.endsWith("]")) {
          const paramName = entry.slice(1, -1);
          newRoutePath += `/:${paramName}`;
        } else {
          newRoutePath += `/${entry}`;
        }

        scanDirectory(fullPath, newRoutePath);
      } else if (entry.endsWith(".html") || entry.endsWith(".js")) {
        const routePattern = routePath || "/";

        if (entry === "+server.js") {
          routes.push({
            type: "server",
            pattern: routePattern,
            filePath: fullPath,
          });
        } else if (entry === "+page.html") {
          routes.push({
            type: "page",
            pattern: routePattern,
            filePath: fullPath,
          });
        }
      }
    }
  }

  scanDirectory(absoluteRoutesDir);
  return routes;
}
