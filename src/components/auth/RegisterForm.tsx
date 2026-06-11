import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AUTH_REGISTER_SUCCESS_MESSAGE,
  AUTH_SUCCESS_REDIRECT,
  consumeAuthSuccessNotice,
  hasActiveSession,
  setAuthSuccessNotice,
  signIn,
  signOut,
  signUp,
} from '../../lib/auth-api';
import { AuthErrorToast } from './AuthToast';
import { AuthShell } from './AuthShell';
import { PasswordField } from './PasswordField';
import styles from './AuthForm.module.scss';

const REDIRECT_URL = AUTH_SUCCESS_REDIRECT;
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const clearError = useCallback(() => setError(''), []);

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

      setCheckingSession(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Ingresa tu nombre.');
      return;
    }

    if (!trimmedEmail) {
      setError('Ingresa tu email.');
      return;
    }

    if (!password) {
      setError('Ingresa tu contraseña.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (!confirmPassword) {
      setError('Confirma tu contraseña.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const result = await signUp(trimmedName, trimmedEmail, password);

    if (result.ok) {
      await signOut();
      setAuthSuccessNotice(AUTH_REGISTER_SUCCESS_MESSAGE);
      window.location.assign('/login');
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
      <AuthShell title="Crear cuenta" subtitle="Empieza a gestionar tu menú digital">
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-name">
              Nombre
            </label>
            <input
              id="register-name"
              className={styles.input}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
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
            id="register-password"
            label="Contraseña"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirmar contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <a className={styles.link} href="/login">
            Inicia sesión
          </a>
        </p>
      </AuthShell>

      {error ? <AuthErrorToast message={error} onDismiss={clearError} /> : null}
    </>
  );
}
