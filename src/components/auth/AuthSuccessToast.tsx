import { AuthToast } from './AuthToast';

interface AuthSuccessToastProps {
  message: string;
  onDismiss?: () => void;
}

export function AuthSuccessToast({ message, onDismiss }: AuthSuccessToastProps) {
  return <AuthToast message={message} variant="success" onDismiss={onDismiss} />;
}
