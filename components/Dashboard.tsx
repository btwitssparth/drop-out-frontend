import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions, RefreshControl } from 'react-native'
import { Card, CardContent, CardHeader } from './ui/card'
import { GraduationCap, TrendingUp, TrendingDown, LogOut, RefreshCw } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PieChart, LineChart } from 'react-native-chart-kit'
import authService from '../services/authService'

const screenWidth = Dimensions.get('window').width

import { AuthScreen } from './auth/types'

interface DashboardProps {
  onNavigate?: (screen: AuthScreen) => void
  onLogout?: () => void
}

interface DashboardData {
  avgGpa: number
  avgAttendance: number
  gpaChange: number
  attendanceChange: number
  riskDistribution: Array<{
    name: string
    value: number
    color: string
    legendFontColor: string
    legendFontSize: number
  }>
  monthlyTrends: Array<{
    month: string
    gpa: number
    attendance: number
    riskScore: number
  }>
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const insets = useSafeAreaInsets()

  // Mock data for demo
  const mockDashboardData: DashboardData = {
    avgGpa: 3.42,
    avgAttendance: 87,
    gpaChange: 2.3,
    attendanceChange: -1.5,
    riskDistribution: [
      {
        name: 'Low Risk',
        value: 62.7,
        color: '#10B981',
        legendFontColor: '#374151',
        legendFontSize: 12
      },
      {
        name: 'Medium Risk',
        value: 18.0,
        color: '#F59E0B',
        legendFontColor: '#374151',
        legendFontSize: 12
      },
      {
        name: 'High Risk',
        value: 19.3,
        color: '#EF4444',
        legendFontColor: '#374151',
        legendFontSize: 12
      }
    ],
    monthlyTrends: [
      { month: 'Jan', gpa: 3.2, attendance: 85, riskScore: 25 },
      { month: 'Feb', gpa: 3.3, attendance: 87, riskScore: 23 },
      { month: 'Mar', gpa: 3.1, attendance: 82, riskScore: 28 },
      { month: 'Apr', gpa: 3.4, attendance: 89, riskScore: 21 },
      { month: 'May', gpa: 3.5, attendance: 91, riskScore: 19 },
      { month: 'Jun', gpa: 3.3, attendance: 88, riskScore: 22 }
    ]
  }

  const lineChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get user data
      const user = await authService.getStoredUserData()
      setUserData(user)

      // Try to fetch dashboard data from API
      try {
        const data = await authService.getDashboardData()
        setDashboardData(data)
      } catch (apiError) {
        // Fallback to mock data
        console.log('API failed, using mock data:', apiError)
        setDashboardData(mockDashboardData)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      Alert.alert('Error', 'Failed to load dashboard data')
      setDashboardData(mockDashboardData) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout()
              onLogout?.()
            } catch (error) {
              console.error('Logout error:', error)
              onLogout?.() // Logout anyway
            }
          }
        }
      ]
    )
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-blue-700 rounded-lg items-center justify-center">
              <GraduationCap size={24} color="white" />
            </View>
            <View>
              <Text className="text-xl font-semibold text-gray-900">Dashboard</Text>
              <Text className="text-sm text-gray-600">
                Welcome, {userData?.name || 'Student'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={handleRefresh}>
              <RefreshCw size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <LogOut size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics Cards */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <Card>
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Avg GPA</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {dashboardData?.avgGpa || '3.42'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {(dashboardData?.gpaChange || 2.3) > 0 ? (
                      <TrendingUp size={16} color="#10B981" />
                    ) : (
                      <TrendingDown size={16} color="#EF4444" />
                    )}
                    <Text className={`text-sm ${(dashboardData?.gpaChange || 2.3) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(dashboardData?.gpaChange || 2.3) > 0 ? '+' : ''}{dashboardData?.gpaChange || 2.3}%
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
          
          <View className="flex-1">
            <Card>
              <CardContent className="p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-medium text-gray-600">Avg Attendance</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {dashboardData?.avgAttendance || 87}%
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {(dashboardData?.attendanceChange || -1.5) > 0 ? (
                      <TrendingUp size={16} color="#10B981" />
                    ) : (
                      <TrendingDown size={16} color="#EF4444" />
                    )}
                    <Text className={`text-sm ${(dashboardData?.attendanceChange || -1.5) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(dashboardData?.attendanceChange || -1.5) > 0 ? '+' : ''}{dashboardData?.attendanceChange || -1.5}%
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Dropout Risk Distribution */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <Text className="text-lg font-semibold text-gray-900">Dropout Risk Distribution</Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="items-center">
              <PieChart
                data={dashboardData?.riskDistribution || mockDashboardData.riskDistribution}
                width={screenWidth - 64}
                height={200}
                chartConfig={lineChartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            
            <View className="mt-4 space-y-3">
              {(dashboardData?.riskDistribution || mockDashboardData.riskDistribution).map((item, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-gray-600">{item.name}</Text>
                  </View>
                  <Text className="text-sm font-medium">{item.value}%</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <Text className="text-lg font-semibold text-gray-900">Monthly Trends</Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="items-center">
              <LineChart
                data={{
                  labels: (dashboardData?.monthlyTrends || mockDashboardData.monthlyTrends).map(item => item.month),
                  datasets: [
                    {
                      data: (dashboardData?.monthlyTrends || mockDashboardData.monthlyTrends).map(item => item.gpa),
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      strokeWidth: 2
                    },
                    {
                      data: (dashboardData?.monthlyTrends || mockDashboardData.monthlyTrends).map(item => item.attendance),
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                      strokeWidth: 2
                    }
                  ],
                  legend: ['GPA', 'Attendance %']
                }}
                width={screenWidth - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={lineChartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader className="pb-4">
            <Text className="text-lg font-semibold text-gray-900">Performance Summary</Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">Risk Level</Text>
                <Text className="text-sm font-medium text-green-600">Low Risk</Text>
              </View>
              <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">Current GPA</Text>
                <Text className="text-sm font-medium">{dashboardData?.avgGpa || '3.42'}</Text>
              </View>
              <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
                <Text className="text-sm text-gray-600">Attendance Rate</Text>
                <Text className="text-sm font-medium">{dashboardData?.avgAttendance || 87}%</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-gray-600">Prediction Accuracy</Text>
                <Text className="text-sm font-medium text-blue-600">94.2%</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Footer */}
      <View className="items-center py-4 bg-white border-t border-gray-200">
        <Text className="text-gray-500 text-xs">© 2025 Dropout Prediction System</Text>
        <Text className="text-gray-500 text-xs">Version 1.0.2</Text>
      </View>
    </View>
  )
}