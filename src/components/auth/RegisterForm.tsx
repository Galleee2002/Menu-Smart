import { useCallback, useEffect, useReducer, type FormEvent } from 'react';
import {
  AUTH_REGISTER_SUCCESS_MESSAGE,
  AUTH_SUCCESS_REDIRECT,
  hasActiveSession,
  setAuthSuccessNotice,
  signIn,
  signOut,
  signUp,
} from '../../lib/auth-api';
import { AuthErrorToast } from './AuthErrorToast';
import { AuthShell } from './AuthShell';
import { PasswordField } from './PasswordField';
import styles from './AuthForm.module.scss';

const REDIRECT_URL = AUTH_SUCCESS_REDIRECT;
const MIN_PASSWORD_LENGTH = 8;

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  checkingSession: boolean;
};

type RegisterFormAction =
  | { type: 'set_name'; value: string }
  | { type: 'set_email'; value: string }
  | { type: 'set_password'; value: string }
  | { type: 'set_confirm_password'; value: string }
  | { type: 'set_error'; message: string }
  | { type: 'clear_error' }
  | { type: 'submit_start' }
  | { type: 'submit_end' }
  | { type: 'session_checked' };

const initialRegisterFormState: RegisterFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  error: '',
  loading: false,
  checkingSession: true,
};

function registerFormReducer(
  state: RegisterFormState,
  action: RegisterFormAction,
): RegisterFormState {
  switch (action.type) {
    case 'set_name':
      return { ...state, name: action.value };
    case 'set_email':
      return { ...state, email: action.value };
    case 'set_password':
      return { ...state, password: action.value };
    case 'set_confirm_password':
      return { ...state, confirmPassword: action.value };
    case 'set_error':
      return { ...state, error: action.message, loading: false };
    case 'clear_error':
      return { ...state, error: '' };
    case 'submit_start':
      return { ...state, loading: true, error: '' };
    case 'submit_end':
      return { ...state, loading: false };
    case 'session_checked':
      return { ...state, checkingSession: false };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function RegisterForm() {
  const [state, dispatch] = useReducer(registerFormReducer, initialRegisterFormState);

  const clearError = useCallback(() => dispatch({ type: 'clear_error' }), []);

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

      dispatch({ type: 'session_checked' });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: 'submit_start' });

    const trimmedName = state.name.trim();
    const trimmedEmail = state.email.trim();

    if (!trimmedName) {
      dispatch({ type: 'set_error', message: 'Ingresa tu nombre.' });
      return;
    }

    if (!trimmedEmail) {
      dispatch({ type: 'set_error', message: 'Ingresa tu email.' });
      return;
    }

    if (!state.password) {
      dispatch({ type: 'set_error', message: 'Ingresa tu contraseña.' });
      return;
    }

    if (state.password.length < MIN_PASSWORD_LENGTH) {
      dispatch({
        type: 'set_error',
        message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }

    if (!state.confirmPassword) {
      dispatch({ type: 'set_error', message: 'Confirma tu contraseña.' });
      return;
    }

    if (state.password !== state.confirmPassword) {
      dispatch({ type: 'set_error', message: 'Las contraseñas no coinciden.' });
      return;
    }

    const result = await signUp(trimmedName, trimmedEmail, state.password);

    if (result.ok) {
      await signOut();
      setAuthSuccessNotice(AUTH_REGISTER_SUCCESS_MESSAGE);
      window.location.assign('/login');
      return;
    }

    dispatch({ type: 'set_error', message: result.message });
  };

  if (state.checkingSession) {
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
              value={state.name}
              onChange={(event) => dispatch({ type: 'set_name', value: event.target.value })}
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
              value={state.email}
              onChange={(event) => dispatch({ type: 'set_email', value: event.target.value })}
              required
            />
          </div>

          <PasswordField
            id="register-password"
            label="Contraseña"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={state.password}
            onChange={(event) => dispatch({ type: 'set_password', value: event.target.value })}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirmar contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={state.confirmPassword}
            onChange={(event) =>
              dispatch({ type: 'set_confirm_password', value: event.target.value })
            }
            minLength={MIN_PASSWORD_LENGTH}
            required
          />

          <button className={styles.submit} type="submit" disabled={state.loading}>
            {state.loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <a className={styles.link} href="/login">
            Inicia sesión
          </a>
        </p>
      </AuthShell>

      {state.error ? <AuthErrorToast message={state.error} onDismiss={clearError} /> : null}
    </>
  );
}
