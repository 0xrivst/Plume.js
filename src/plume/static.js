/**
 * Copyright (c) 2025 rivst
 * SPDX-License-Identifier: MIT
 */

import { file } from "bun";
import { join, resolve, extname } from "path";

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".jsx": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

export async function serveStatic(pathname, staticDir) {
  try {
    const filePath = resolve(join(staticDir, pathname));
    const staticPath = resolve(staticDir);

    if (!filePath.startsWith(staticPath)) {
      return null;
    }

    const bunFile = file(filePath);

    if (await bunFile.exists()) {
      const ext = extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";

      return new Response(bunFile, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    return null;
  } catch (error) {
    return null;
  }
}
