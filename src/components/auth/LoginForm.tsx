import { useCallback, useEffect, useReducer, type FormEvent } from 'react';
import {
  AUTH_SUCCESS_REDIRECT,
  consumeAuthSuccessNotice,
  hasActiveSession,
  signIn,
} from '../../lib/auth-api';
import { AuthErrorToast } from './AuthErrorToast';
import { AuthSuccessToast } from './AuthSuccessToast';
import { AuthShell } from './AuthShell';
import { PasswordField } from './PasswordField';
import styles from './AuthForm.module.scss';

const REDIRECT_URL = AUTH_SUCCESS_REDIRECT;

type LoginFormState = {
  email: string;
  password: string;
  error: string;
  success: string;
  loading: boolean;
  checkingSession: boolean;
};

type LoginFormAction =
  | { type: 'set_email'; value: string }
  | { type: 'set_password'; value: string }
  | { type: 'set_error'; message: string }
  | { type: 'clear_error' }
  | { type: 'set_success'; message: string }
  | { type: 'clear_success' }
  | { type: 'submit_start' }
  | { type: 'submit_end' }
  | { type: 'session_checked'; success?: string };

const initialLoginFormState: LoginFormState = {
  email: '',
  password: '',
  error: '',
  success: '',
  loading: false,
  checkingSession: true,
};

function loginFormReducer(state: LoginFormState, action: LoginFormAction): LoginFormState {
  switch (action.type) {
    case 'set_email':
      return { ...state, email: action.value };
    case 'set_password':
      return { ...state, password: action.value };
    case 'set_error':
      return { ...state, error: action.message, loading: false };
    case 'clear_error':
      return { ...state, error: '' };
    case 'set_success':
      return { ...state, success: action.message };
    case 'clear_success':
      return { ...state, success: '' };
    case 'submit_start':
      return { ...state, loading: true, error: '' };
    case 'submit_end':
      return { ...state, loading: false };
    case 'session_checked':
      return {
        ...state,
        checkingSession: false,
        success: action.success ?? state.success,
      };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function LoginForm() {
  const [state, dispatch] = useReducer(loginFormReducer, initialLoginFormState);

  const clearError = useCallback(() => dispatch({ type: 'clear_error' }), []);
  const clearSuccess = useCallback(() => dispatch({ type: 'clear_success' }), []);

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
      dispatch({ type: 'session_checked', success: notice ?? undefined });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: 'submit_start' });

    const trimmedEmail = state.email.trim();

    if (!trimmedEmail) {
      dispatch({ type: 'set_error', message: 'Ingresa tu email.' });
      return;
    }

    if (!state.password) {
      dispatch({ type: 'set_error', message: 'Ingresa tu contraseña.' });
      return;
    }

    const result = await signIn(trimmedEmail, state.password);

    if (result.ok) {
      window.location.assign(REDIRECT_URL);
      return;
    }

    dispatch({ type: 'set_error', message: result.message });
  };

  if (state.checkingSession) {
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
              value={state.email}
              onChange={(event) => dispatch({ type: 'set_email', value: event.target.value })}
              required
            />
          </div>

          <PasswordField
            id="login-password"
            label="Contraseña"
            name="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={state.password}
            onChange={(event) => dispatch({ type: 'set_password', value: event.target.value })}
            required
          />

          <button className={styles.submit} type="submit" disabled={state.loading}>
            {state.loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿No tienes cuenta?{' '}
          <a className={styles.link} href="/register">
            Regístrate
          </a>
        </p>
      </AuthShell>

      {state.error ? <AuthErrorToast message={state.error} onDismiss={clearError} /> : null}
      {state.success ? <AuthSuccessToast message={state.success} onDismiss={clearSuccess} /> : null}
    </>
  );
}
