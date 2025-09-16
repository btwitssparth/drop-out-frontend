export type AuthScreen = 'signin' | 'forgot-password' | 'reset-password' | 'signup' | 'dashboard' | 'counselor-dashboard';

export interface AuthNavigationProps {
  onNavigate: (screen: AuthScreen) => void;
  currentScreen?: AuthScreen;
}