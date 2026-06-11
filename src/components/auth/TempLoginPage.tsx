import { useCallback, useEffect, useState } from 'react';
import { getSession, signOut, type AuthUser } from '../../lib/auth-api';
import { AuthErrorToast } from './AuthToast';
import { AuthShell } from './AuthShell';
import styles from './AuthForm.module.scss';

export function TempLoginPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    let cancelled = false;

    getSession().then((session) => {
      if (cancelled) {
        return;
      }

      if (!session) {
        window.location.replace('/login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setError('');
    setLoggingOut(true);

    const result = await signOut();

    if (result.ok) {
      window.location.replace('/login');
      return;
    }

    setError(result.message);
    setLoggingOut(false);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <AuthShell title="Sesión activa" subtitle="Has iniciado sesión correctamente">
        <div className={styles.form}>
          <p className={styles.sessionInfo}>
            Conectado como <strong>{user.name}</strong>
            <br />
            <span>{user.email}</span>
          </p>

          <button
            className={styles.submit}
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </AuthShell>

      {error ? <AuthErrorToast message={error} onDismiss={clearError} /> : null}
    </>
  );
}
