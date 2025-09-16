import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { GraduationCap, Eye, EyeOff, Shield, CheckCircle, ArrowLeft } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import authService from '../../services/authService'
import { AuthNavigationProps } from './types'

interface ResetPasswordProps extends AuthNavigationProps {
  resetToken?: string;
}

export function ResetPassword({ onNavigate, resetToken }: ResetPasswordProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const insets = useSafeAreaInsets()

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(pwd)) {
      return 'Password must contain both uppercase and lowercase letters'
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleReset = async () => {
    // Validation
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a new password.')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      Alert.alert('Password Error', passwordError)
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      
      // Demo mode: If no reset token, simulate successful reset
      if (!resetToken) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsReset(true)
        Alert.alert(
          'Demo Mode', 
          'Password reset simulated successfully! In production, this would update your actual password.'
        )
      } else {
        // Real mode: Use actual API
        await authService.resetPassword(resetToken, password)
        setIsReset(true)
        Alert.alert(
          'Password Reset Successfully', 
          'Your password has been updated. You can now sign in with your new password.'
        )
      }
    } catch (error) {
      Alert.alert('Reset Failed', error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-blue-700 rounded-2xl mb-4 items-center justify-center">
            <GraduationCap size={32} color="white" />
          </View>
          <Text className="text-2xl font-semibold text-gray-900 mb-2">Dropout Prediction</Text>
          <Text className="text-gray-600">Predict & Prevent Student Dropouts</Text>
        </View>

        {/* Reset Password Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="items-center pb-6">
            <Text className="text-xl font-semibold text-gray-900">Reset Password</Text>
            <Text className="text-gray-600 text-sm text-center mt-2">
              {isReset 
                ? "Your password has been successfully reset" 
                : "Enter your new password"
              }
            </Text>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {!isReset ? (
              <View className="space-y-6">
                {/* New Password Field */}
                <View className="space-y-2">
                  <Label>New Password</Label>
                  <View className="relative">
                    <Input
                      placeholder="Enter your new password"
                      value={password}
                      onChangeText={setPassword}
                      className="pr-10"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff size={16} color="#9CA3AF" />
                      ) : (
                        <Eye size={16} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Field */}
                <View className="space-y-2">
                  <Label>Confirm Password</Label>
                  <View className="relative">
                    <Input
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      className="pr-10"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} color="#9CA3AF" />
                      ) : (
                        <Eye size={16} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Requirements */}
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-xs font-medium text-gray-700 mb-2">Password must contain:</Text>
                  <View className="space-y-1">
                    <Text className="text-xs text-gray-600">• At least 8 characters</Text>
                    <Text className="text-xs text-gray-600">• Uppercase and lowercase letters</Text>
                    <Text className="text-xs text-gray-600">• At least one number</Text>
                  </View>
                </View>

                {/* Reset Password Button */}
                <Button 
                  onPress={handleReset}
                  className="w-full bg-blue-700 py-3 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                      <Text className="text-white font-medium">Resetting...</Text>
                    </View>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </View>
            ) : (
              <View className="space-y-6">
                <View className="items-center space-y-4">
                  <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
                    <CheckCircle size={32} color="#059669" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Password Reset!</Text>
                  <Text className="text-gray-600 text-sm text-center">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </Text>
                </View>
                
                {/* Go to Sign In Button */}
                <Button 
                  onPress={() => onNavigate('signin')}
                  className="w-full bg-blue-700 py-3"
                >
                  Go to Sign In
                </Button>
              </View>
            )}

            {/* Back Navigation */}
            {!isReset && (
              <View className="items-center pt-6 mt-6 border-t border-gray-200">
                <TouchableOpacity 
                  onPress={() => onNavigate('forgot-password')}
                  className="flex-row items-center space-x-2"
                >
                  <ArrowLeft size={16} color="#2563EB" />
                  <Text className="text-blue-600 text-sm ml-2">Back to Forgot Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <View className="flex-row items-center gap-3 mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md w-full mx-auto">
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
            <Shield size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-900 text-sm">Secure Reset</Text>
            <Text className="text-gray-600 text-xs">Your new password is encrypted and protected</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center mt-8 space-y-1">
          <Text className="text-gray-500 text-xs">Version 1.0.2</Text>
          <Text className="text-gray-500 text-xs">© 2025 Dropout Prediction System.</Text>
          <Text className="text-gray-500 text-xs">All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  )
}