const PUBLIC_EXACT_PATHS = new Set(['/', '/example', '/login', '/register']);

const PUBLIC_PREFIXES = ['/api', '/_astro', '/favicon'];

const PROTECTED_PREFIXES = ['/admin'];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
