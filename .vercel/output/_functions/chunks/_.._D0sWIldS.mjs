import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

class AppError extends Error {
  status;
  code;
  constructor(message, status = 500, code) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
function isAppError(error) {
  return error instanceof AppError;
}

const DEFAULT_DEV_ORIGIN = "http://localhost:4321";
function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS ?? DEFAULT_DEV_ORIGIN;
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
}

function ok(c, data, status = 200) {
  return c.json({ success: true, data }, status);
}
function fail(c, message, status = 500) {
  return c.json({ success: false, error: { message } }, status);
}

const app = new Hono().basePath("/api");
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: getAllowedOrigins(),
    credentials: true
  })
);
app.onError((err, c) => {
  console.error(err);
  if (isAppError(err)) {
    return fail(c, err.message, err.status);
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return fail(c, message, 500);
});
app.notFound((c) => fail(c, "Not Found", 404));
app.get("/health", (c) => ok(c, { status: "ok" }));

const prerender = false;
const handle = ({ request }) => app.fetch(request);
const GET = handle;
const POST = handle;
const PUT = handle;
const PATCH = handle;
const DELETE = handle;
const OPTIONS = handle;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
