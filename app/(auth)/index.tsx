import { useState } from 'react'
import { LoginScreen } from '../../components/auth/LoginScreen'
import { ForgotPassword } from '../../components/auth/ForgotPassword'
import { ResetPassword } from '../../components/auth/ResetPassword'
import { Dashboard } from '../../components/Dashboard'
import { AuthScreen } from '../../components/auth/types'

export default function AuthIndex() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('signin')
  const [resetToken, setResetToken] = useState<string | undefined>(undefined)

  const handleNavigate = (screen: AuthScreen) => {
    setCurrentScreen(screen)
  }

  const handleResetToken = (token: string) => {
    setResetToken(token)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'signin':
        return <LoginScreen onNavigate={handleNavigate} currentScreen={currentScreen} />
      case 'forgot-password':
        return (
          <ForgotPassword 
            onNavigate={handleNavigate} 
            currentScreen={currentScreen}
            onResetToken={handleResetToken}
          />
        )
      case 'reset-password':
        return (
          <ResetPassword 
            onNavigate={handleNavigate} 
            currentScreen={currentScreen}
            resetToken={resetToken}
          />
        )
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigate}
            onLogout={() => setCurrentScreen('signin')}
          />
        )
      default:
        return <LoginScreen onNavigate={handleNavigate} currentScreen={currentScreen} />
    }
  }

  return renderScreen()
}
