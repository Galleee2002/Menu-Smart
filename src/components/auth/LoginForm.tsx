import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AUTH_SUCCESS_REDIRECT, consumeAuthSuccessNotice, hasActiveSession, signIn } from '../../lib/auth-api';
import { AuthErrorToast, AuthSuccessToast } from './AuthToast';
import { AuthShell } from './AuthShell';
import { PasswordField } from './PasswordField';
import styles from './AuthForm.module.scss';

const REDIRECT_URL = AUTH_SUCCESS_REDIRECT;

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const clearError = useCallback(() => setError(''), []);
  const clearSuccess = useCallback(() => setSuccess(''), []);

  useEffect(() => {
    let cancelled = false;

    hasActiveSession().then((active) => {
      if (cancelled) {
        return;
      }

      if (active) {
        window.location.replace(REDIRECT_URL);
        return;
      }

      const notice = consumeAuthSuccessNotice();
      if (notice) {
        setSuccess(notice);
      }

      setCheckingSession(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Ingresa tu email.');
      return;
    }

    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    setLoading(true);

    const result = await signIn(trimmedEmail, password);

    if (result.ok) {
      window.location.assign(REDIRECT_URL);
      return;
    }

    setError(result.message);
    setLoading(false);
  };

  if (checkingSession) {
    return null;
  }

  return (
    <>
      <AuthShell title="Iniciar sesión" subtitle="Accede a tu cuenta de SmartMenu">
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <PasswordField
            id="login-password"
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿No tienes cuenta?{' '}
          <a className={styles.link} href="/register">
            Regístrate
          </a>
        </p>
      </AuthShell>

      {error ? <AuthErrorToast message={error} onDismiss={clearError} /> : null}
      {success ? <AuthSuccessToast message={success} onDismiss={clearSuccess} /> : null}
    </>
  );
}
