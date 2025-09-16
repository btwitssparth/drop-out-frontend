import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { GraduationCap, Mail, Shield, ArrowLeft } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import authService from '../../services/authService'
import { AuthNavigationProps } from './types'

interface ForgotPasswordProps extends AuthNavigationProps {
  onResetToken?: (token: string) => void;
}

export function ForgotPassword({ onNavigate, onResetToken }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const insets = useSafeAreaInsets()

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.')
      return
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.')
      return
    }

    try {
      setLoading(true)
      
      try {
        const response = await authService.forgotPassword(email)
        
        // Store reset token if provided by backend
        if (response.resetToken && onResetToken) {
          onResetToken(response.resetToken)
        }
        
        setIsSubmitted(true)
        Alert.alert(
          'Reset Email Sent', 
          'Password reset instructions have been sent to your email.'
        )
      } catch (apiError) {
        // If API fails, run in demo mode
        console.log('API failed, running in demo mode:', apiError)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setIsSubmitted(true)
        Alert.alert(
          'Demo Mode - Email Sent', 
          'This is demo mode. In production, reset instructions would be sent to your email.'
        )
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
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

        {/* Forgot Password Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            {!isSubmitted ? (
              <View className="space-y-6">
                <View className="space-y-2">
                  <Text className="text-lg font-semibold text-gray-900 text-center mb-4">
                    Forgot Password
                  </Text>
                  <Text className="text-gray-600 text-sm text-center mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>
                </View>

                {/* Email Field */}
                <View className="space-y-2">
                  <Label>Email Address</Label>
                  <View className="relative">
                    <Input
                      placeholder="Enter your email address"
                      value={email}
                      onChangeText={setEmail}
                      className="pl-10"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                    <View className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Mail size={16} color="#9CA3AF" />
                    </View>
                  </View>
                </View>

                {/* Send Reset Link Button */}
                <Button 
                  onPress={handleSubmit}
                  className="w-full bg-blue-700 py-3 mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                      <Text className="text-white font-medium">Sending...</Text>
                    </View>
                  ) : (
                    'Send'
                  )}
                </Button>
              </View>
            ) : (
              <View className="space-y-6">
                <View className="items-center space-y-4">
                  <Text className="text-lg font-semibold text-gray-900 text-center">
                    Reset Email Sent
                  </Text>
                  <Text className="text-gray-600 text-sm text-center">
                    We've sent a password reset link to your email. Click continue to proceed with resetting your password.
                  </Text>
                </View>

                {/* Continue to Reset Password Button */}
                <Button 
                  onPress={() => onNavigate('reset-password')}
                  className="w-full bg-blue-700 py-3"
                >
                  Continue to Reset Password
                </Button>
              </View>
            )}

            {/* Back to Sign In */}
            <View className="items-center pt-6 mt-6 border-t border-gray-200">
              <TouchableOpacity 
                onPress={() => onNavigate('signin')}
                className="flex-row items-center space-x-2"
              >
                <ArrowLeft size={16} color="#2563EB" />
                <Text className="text-blue-600 text-sm ml-2">Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <View className="flex-row items-center gap-3 mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md w-full mx-auto">
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
            <Shield size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-900 text-sm">Secure Reset</Text>
            <Text className="text-gray-600 text-xs">Password reset links expire in 24 hours</Text>
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