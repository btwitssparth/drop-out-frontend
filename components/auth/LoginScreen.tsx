import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { GraduationCap, User, Eye, EyeOff, Shield } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import authService from '../../services/authService'
import { AuthNavigationProps } from './types'

export function LoginScreen({ onNavigate }: AuthNavigationProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()

  const handleForgotPassword = () => {
    onNavigate('forgot-password')
  }

  const handleCreateAccount = () => {
    Alert.alert('Create Account', 'Account creation functionality will be implemented here.')
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      
      // Determine if input is email or userId
      const isEmail = email.includes('@')
      const loginData = isEmail 
        ? { email, password }
        : { userId: email, password }

      const response = await authService.login(loginData)
      
      Alert.alert(
        'Success', 
        `Welcome back, ${response.user.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to dashboard based on user role
              if (response.user.role === 'counselor') {
                onNavigate('counselor-dashboard')
              } else {
                onNavigate('dashboard')
              }
            }
          }
        ]
      )
      
    } catch (error) {
      Alert.alert(
        'Login Failed', 
        error instanceof Error ? error.message : 'An error occurred during login'
      )
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

        {/* Login Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="items-center pb-6">
            <Text className="text-xl font-semibold text-gray-900">Welcome Back</Text>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <View className="space-y-6">
              {/* Email/Username Field */}
              <View className="space-y-2">
                <Label>Email / Username</Label>
                <View className="relative">
                  <Input
                    placeholder="Enter your email or username"
                    value={email}
                    onChangeText={setEmail}
                    className="pl-10"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                  <View className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User size={16} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Password Field */}
              <View className="space-y-2">
                <Label>Password</Label>
                <View className="relative">
                  <Input
                    placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <View className="items-end">
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="text-blue-600 text-sm">Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button 
                className="w-full bg-blue-700 py-3"
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-medium">Signing In...</Text>
                  </View>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Bottom Links */}
              <View className="items-center pt-4 space-y-2">
                <View className="flex-row">
                  <Text className="text-gray-600 text-sm">Don't have an account? </Text>
                  <TouchableOpacity onPress={handleCreateAccount}>
                    <Text className="text-blue-600 text-sm">Create Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <View className="flex-row items-center gap-3 mt-8 p-4 bg-white rounded-lg shadow-sm max-w-md w-full mx-auto">
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
            <Shield size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-900 text-sm">Secure Login</Text>
            <Text className="text-gray-600 text-xs">Your data is encrypted and protected</Text>
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