const AUTH_BASE = '/api/auth';

export const AUTH_SUCCESS_REDIRECT = '/admin';
export const AUTH_SUCCESS_NOTICE_KEY = 'smartmenu-auth-success-notice';
export const AUTH_REGISTER_SUCCESS_MESSAGE =
  'Cuenta creada correctamente. Inicia sesión con tu email y contraseña.';

export function setAuthSuccessNotice(message: string): void {
  sessionStorage.setItem(AUTH_SUCCESS_NOTICE_KEY, message);
}

export function consumeAuthSuccessNotice(): string | null {
  const message = sessionStorage.getItem(AUTH_SUCCESS_NOTICE_KEY);
  if (message) {
    sessionStorage.removeItem(AUTH_SUCCESS_NOTICE_KEY);
  }
  return message;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

async function parseAuthError(res: Response): Promise<string> {
  if (res.status === 429) {
    return 'Demasiados intentos. Espera unos segundos e inténtalo de nuevo.';
  }

  try {
    const body: unknown = await res.json();

    if (typeof body === 'object' && body !== null) {
      if ('message' in body && typeof body.message === 'string') {
        return localizeAuthMessage(body.message);
      }

      if ('error' in body) {
        const error = body.error;
        if (typeof error === 'string') {
          return localizeAuthMessage(error);
        }
        if (typeof error === 'object' && error !== null && 'message' in error) {
          const message = error.message;
          if (typeof message === 'string') {
            return localizeAuthMessage(message);
          }
        }
      }
    }
  } catch {
    // Fall through to generic message.
  }

  if (res.status === 401) {
    return 'Email o contraseña incorrectos.';
  }

  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

function localizeAuthMessage(message: string): string {
  const normalized = message.trim().toLowerCase();

  if (normalized === 'invalid email or password') {
    return 'Email o contraseña incorrectos.';
  }

  return message;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    return { ok: true };
  }

  return { ok: false, message: await parseAuthError(res) };
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_BASE}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });

  if (res.ok) {
    return { ok: true };
  }

  return { ok: false, message: await parseAuthError(res) };
}

export async function getSession(): Promise<{ user: AuthUser } | null> {
  const res = await fetch(`${AUTH_BASE}/get-session`, {
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  const data: unknown = await res.json();

  if (typeof data !== 'object' || data === null || !('user' in data) || data.user === null) {
    return null;
  }

  const user = data.user;
  if (
    typeof user !== 'object' ||
    user === null ||
    !('id' in user) ||
    !('name' in user) ||
    !('email' in user) ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string' ||
    typeof user.email !== 'string'
  ) {
    return null;
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function hasActiveSession(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function signOut(): Promise<AuthResult> {
  const res = await fetch(`${AUTH_BASE}/sign-out`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  if (res.ok) {
    return { ok: true };
  }

  return { ok: false, message: await parseAuthError(res) };
}
