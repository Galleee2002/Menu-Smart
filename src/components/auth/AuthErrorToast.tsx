import { AuthToast } from './AuthToast';

interface AuthErrorToastProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthErrorToast({ message, onDismiss }: AuthErrorToastProps) {
  return <AuthToast message={message} variant="error" onDismiss={onDismiss} />;
}
