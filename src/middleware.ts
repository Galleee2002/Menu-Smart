import { defineMiddleware } from 'astro:middleware';
import { auth } from './server/lib/auth';
import { isProtectedPath, isPublicPath } from './lib/public-routes';

async function getSessionUser(request: Request): Promise<unknown | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (isPublicPath(pathname)) {
    return next();
  }

  if (isProtectedPath(pathname)) {
    const user = await getSessionUser(context.request);

    if (!user) {
      return context.redirect('/login');
    }
  }

  return next();
});
