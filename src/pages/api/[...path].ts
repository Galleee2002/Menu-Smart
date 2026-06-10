import type { APIRoute } from "astro";
import app from "../../server";

export const prerender = false;

const handle: APIRoute = ({ request }) => app.fetch(request);

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
