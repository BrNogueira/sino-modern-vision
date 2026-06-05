import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";

import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import { auth } from "./auth/index.js";
import { attachSession } from "./middleware/auth.js";
import { dataRouter } from "./routes/data.js";
import { rpcRouter } from "./routes/rpc.js";
import { feedRouter } from "./routes/feed.js";
import { storageRouter } from "./routes/storage.js";
import { adminRouter } from "./routes/admin.js";

const app = new Hono();

app.use("*", honoLogger());
app.use(
  "*",
  cors({
    origin: env.AUTH_TRUSTED_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use("*", attachSession);

// Better-auth (/api/auth/*)
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/health", (c) => c.json({ ok: true, env: env.NODE_ENV }));

app.route("/api/data", dataRouter);
app.route("/api/rpc", rpcRouter);
app.route("/api/feed", feedRouter);
app.route("/api/storage", storageRouter);
app.route("/api/admin", adminRouter);

app.onError((err, c) => {
  logger.error({ err }, "request_error");
  return c.json({ error: "internal_error", message: err.message }, 500);
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(`sino-modern-vision API rodando em http://localhost:${info.port}`);
});
