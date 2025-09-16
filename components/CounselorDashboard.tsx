import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, MoreVertical, Users, TrendingUp, User, AlertTriangle, Shield, AlertCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader } from './ui/card';
import authService from '../services/authService';
import { AuthScreen } from './auth/types';

interface CounselorDashboardProps {
  onNavigate?: (screen: AuthScreen) => void;
  onBack?: () => void;
}

interface Student {
  studentId: string;
  name: string;
  course: string;
  year: number;
  currentSemester: number;
  currentGpa: number;
  currentAttendance: number;
  currentBacklogs: number;
  currentRiskStatus: string;
  totalSemesters: number;
}

interface CounselorData {
  counselor: {
    userId: string;
    name: string;
    department?: string;
  };
  students: Student[];
  summary: {
    totalStudents: number;
    avgGpa: number;
    avgAttendance: number;
    riskDistribution: {
      safe: number;
      warning: number;
      atRisk: number;
    };
    riskCounts: {
      safe: number;
      warning: number;
      atRisk: number;
    };
  };
}

// Mock data fallback - moved outside component to avoid dependency issues
const mockCounselorData: CounselorData = {
  counselor: {
    userId: 'CNS001',
    name: 'Dr. Sarah Wilson',
    department: 'Computer Science',
  },
  students: [
    {
      studentId: 'STU2024001',
      name: 'Sarah Johnson',
      course: 'Computer Science',
      year: 2,
      currentSemester: 3,
      currentGpa: 2.3,
      currentAttendance: 65,
      currentBacklogs: 2,
      currentRiskStatus: 'High Risk',
      totalSemesters: 3,
    },
    {
      studentId: 'STU2024002',
      name: 'Michael Chen',
      course: 'Business Admin',
      year: 1,
      currentSemester: 2,
      currentGpa: 2.8,
      currentAttendance: 78,
      currentBacklogs: 1,
      currentRiskStatus: 'Medium Risk',
      totalSemesters: 2,
    },
    {
      studentId: 'STU2024003',
      name: 'Emma Wilson',
      course: 'Engineering',
      year: 2,
      currentSemester: 4,
      currentGpa: 3.7,
      currentAttendance: 95,
      currentBacklogs: 0,
      currentRiskStatus: 'Low Risk',
      totalSemesters: 4,
    },
    {
      studentId: 'STU2024004',
      name: 'David Rodriguez',
      course: 'Mathematics',
      year: 1,
      currentSemester: 1,
      currentGpa: 1.9,
      currentAttendance: 45,
      currentBacklogs: 3,
      currentRiskStatus: 'High Risk',
      totalSemesters: 1,
    },
    {
      studentId: 'STU2024005',
      name: 'Lisa Park',
      course: 'Physics',
      year: 2,
      currentSemester: 3,
      currentGpa: 3.1,
      currentAttendance: 82,
      currentBacklogs: 0,
      currentRiskStatus: 'Medium Risk',
      totalSemesters: 3,
    },
  ],
  summary: {
    totalStudents: 5,
    avgGpa: 2.6,
    avgAttendance: 73,
    riskDistribution: {
      safe: 20.0,
      warning: 40.0,
      atRisk: 40.0,
    },
    riskCounts: {
      safe: 1,
      warning: 2,
      atRisk: 2,
    },
  },
};

export function CounselorDashboard({ onNavigate, onBack }: CounselorDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counselorData, setCounselorData] = useState<CounselorData | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const insets = useSafeAreaInsets();

  const loadCounselorData = useCallback(async () => {
    try {
      setLoading(true);
      setIsUsingMockData(false);

      const data = await authService.getCounselorDashboard();
      setCounselorData(data);
      console.log('✅ Successfully loaded counselor dashboard data');
    } catch (error) {
      console.log('⚠️ API failed, using mock data:', error);
      setCounselorData(mockCounselorData);
      setIsUsingMockData(true);
      Alert.alert(
        'Using Demo Data',
        'Could not connect to backend. Showing demo data instead.\\n\\nMake sure you are logged in as a counselor.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCounselorData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCounselorData();
  }, [loadCounselorData]);

  // Helper functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-red-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    const risk = riskLevel.toLowerCase();
    if (risk.includes('low risk') || risk.includes('safe')) return 'bg-green-50 text-green-600 border-green-200';
    if (risk.includes('medium risk') || risk.includes('warning')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (risk.includes('high risk') || risk.includes('at risk')) return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getRiskIcon = (riskLevel: string) => {
    const risk = riskLevel.toLowerCase();
    if (risk.includes('low risk') || risk.includes('safe')) return <Shield size={14} color="#10B981" />;
    if (risk.includes('medium risk') || risk.includes('warning')) return <AlertTriangle size={14} color="#F59E0B" />;
    if (risk.includes('high risk') || risk.includes('at risk')) return <AlertCircle size={14} color="#EF4444" />;
    return <AlertCircle size={14} color="#6B7280" />;
  };

  const getAttendanceBarColor = (attendance: number) => {
    if (attendance >= 80) return 'bg-green-500';
    if (attendance >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading counselor dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            {onBack && (
              <TouchableOpacity onPress={onBack} className="p-1">
                <ArrowLeft size={20} color="#374151" />
              </TouchableOpacity>
            )}
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-semibold text-gray-900">Counselor Dashboard</Text>
                {isUsingMockData ? (
                  <View className="bg-orange-100 px-2 py-1 rounded">
                    <Text className="text-xs text-orange-600 font-medium">DEMO</Text>
                  </View>
                ) : (
                  <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-xs text-green-600 font-medium">LIVE</Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-gray-600">
                {counselorData?.counselor?.name} - {counselorData?.counselor?.department}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <MoreVertical size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View className="gap-4 mb-6">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Card>
                <CardContent className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-sm font-medium text-gray-600">Total Students</Text>
                      <Text className="text-2xl font-bold text-gray-900">
                        {counselorData?.summary?.totalStudents || 0}
                      </Text>
                    </View>
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                      <Users size={20} color="#2563EB" />
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
                      <Text className="text-sm font-medium text-gray-600">Avg GPA</Text>
                      <Text className="text-2xl font-bold text-gray-900">
                        {counselorData?.summary?.avgGpa?.toFixed(1) || '0.0'}
                      </Text>
                    </View>
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                      <TrendingUp size={20} color="#10B981" />
                    </View>
                  </View>
                </CardContent>
              </Card>
            </View>
          </View>

          <Card>
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-gray-600">Average Attendance</Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {counselorData?.summary?.avgAttendance?.toFixed(0)}%
                  </Text>
                </View>
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                  <TrendingUp size={20} color="#7C3AED" />
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Risk Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <Text className="text-lg font-semibold text-gray-900">Risk Overview</Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="flex-row justify-between mb-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {counselorData?.summary?.riskCounts?.safe || 0}
                </Text>
                <Text className="text-sm text-gray-600">Safe</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-yellow-600">
                  {counselorData?.summary?.riskCounts?.warning || 0}
                </Text>
                <Text className="text-sm text-gray-600">Warning</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-red-600">
                  {counselorData?.summary?.riskCounts?.atRisk || 0}
                </Text>
                <Text className="text-sm text-gray-600">At Risk</Text>
              </View>
            </View>
            <View className="pt-4 border-t border-gray-200">
              <Text className="text-sm text-gray-600 mb-2">Risk Distribution</Text>
              <View className="flex-row justify-between">
                <Text className="text-sm text-green-600">
                  {counselorData?.summary?.riskDistribution?.safe?.toFixed(1)}% Safe
                </Text>
                <Text className="text-sm text-yellow-600">
                  {counselorData?.summary?.riskDistribution?.warning?.toFixed(1)}% Warning
                </Text>
                <Text className="text-sm text-red-600">
                  {counselorData?.summary?.riskDistribution?.atRisk?.toFixed(1)}% At Risk
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader className="pb-4">
            <Text className="text-lg font-semibold text-gray-900">Students</Text>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <View className="space-y-4">
              {counselorData?.students?.map((student) => (
                <TouchableOpacity 
                  key={student.studentId} 
                  className="bg-white rounded-lg p-4 border border-gray-200"
                  activeOpacity={0.7}
                  onPress={() => {
                    // TODO: Navigate to individual student details
                    Alert.alert('Student Details', `View details for ${student.name}`);
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center ${getAvatarColor(
                          student.name
                        )}`}
                      >
                        <Text className="text-white font-medium">
                          {getInitials(student.name)}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-medium text-gray-900">{student.name}</Text>
                        <Text className="text-sm text-gray-500">ID: {student.studentId}</Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1 rounded-full border flex-row items-center gap-1 ${getRiskBadgeColor(student.currentRiskStatus)}`}>
                      {getRiskIcon(student.currentRiskStatus)}
                      <Text className="text-xs font-medium">{student.currentRiskStatus}</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                      <Text className="text-sm text-gray-500 mb-1">Course</Text>
                      <Text className="font-medium text-gray-900">{student.course}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-500 mb-1">Year {student.year}</Text>
                      <Text className="font-medium text-gray-900">Sem {student.currentSemester}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm text-gray-500 mb-2">Attendance</Text>
                      <View className="flex-row items-center gap-2">
                        <View className="flex-1 bg-gray-200 rounded-full h-2">
                          <View
                            className={`h-2 rounded-full ${getAttendanceBarColor(student.currentAttendance)}`}
                            style={{ width: `${student.currentAttendance}%` }}
                          />
                        </View>
                        <Text className="text-sm font-medium text-gray-900">
                          {student.currentAttendance}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-500 mb-1">CGPA</Text>
                      <Text className="font-medium text-gray-900">
                        {student.currentGpa?.toFixed(1) || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {student.currentBacklogs > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-200">
                      <Text className="text-sm text-red-600">
                        ⚠️ {student.currentBacklogs} Backlog{student.currentBacklogs !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )) || []}

              {(!counselorData?.students || counselorData.students.length === 0) && (
                <View className="py-8 items-center">
                  <User size={48} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No students assigned</Text>
                  <Text className="text-gray-400 text-sm text-center">
                    Students will appear here once they are assigned to you
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}