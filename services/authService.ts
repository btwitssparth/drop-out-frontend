import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API base URL - change this to your backend IP when running on device
const API_BASE_URL = 'http://localhost:5003';

export interface LoginData {
  email?: string;
  userId?: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    userId: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface SignupData {
  name: string;
  email?: string;
  password: string;
  role?: string;
}

class AuthService {
  private async makeRequest(endpoint: string, options: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await this.makeRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    // Store token in AsyncStorage for future requests
    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  async signup(signupData: SignupData) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Even if backend call fails, clear local storage
      console.log('Logout error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  }

  async getProfile() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.makeRequest('/auth/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token !== null;
    } catch {
      return false;
    }
  }

  async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  async getDashboardData() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the current user data to get their userId
    const userData = await this.getStoredUserData();
    if (!userData || !userData.userId) {
      throw new Error('User data not found');
    }

    const response = await this.makeRequest(`/api/dashboard/student/${userData.userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Transform the backend response to match frontend expectations
    return this.transformDashboardData(response);
  }

  private transformDashboardData(backendResponse: any) {
    const { student, dashboard } = backendResponse;
    
    if (!dashboard || dashboard.length === 0) {
      throw new Error('No dashboard data available');
    }

    // Calculate overall statistics
    const totalSemesters = dashboard.length;
    const avgGpa = dashboard.reduce((sum: number, record: any) => sum + (record.gpa || 0), 0) / totalSemesters;
    const avgAttendance = dashboard.reduce((sum: number, record: any) => sum + (record.attendancePercentage || 0), 0) / totalSemesters;
    
    // Calculate trend changes (comparing last 2 semesters if available)
    let gpaChange = 0;
    let attendanceChange = 0;
    if (totalSemesters >= 2) {
      const latest = dashboard[totalSemesters - 1];
      const previous = dashboard[totalSemesters - 2];
      gpaChange = latest.gpa && previous.gpa ? ((latest.gpa - previous.gpa) / previous.gpa) * 100 : 0;
      attendanceChange = latest.attendancePercentage && previous.attendancePercentage ? 
        ((latest.attendancePercentage - previous.attendancePercentage) / previous.attendancePercentage) * 100 : 0;
    }

    // Calculate risk distribution
    const riskCounts = { safe: 0, warning: 0, 'at risk': 0 };
    dashboard.forEach((record: any) => {
      const risk = record.riskStatus?.toLowerCase() || 'safe';
      if (risk.includes('safe')) riskCounts.safe++;
      else if (risk.includes('warning')) riskCounts.warning++;
      else riskCounts['at risk']++;
    });

    const riskDistribution = [
      {
        name: 'Low Risk',
        value: Math.round((riskCounts.safe / totalSemesters) * 100 * 10) / 10,
        color: '#10B981',
        legendFontColor: '#374151',
        legendFontSize: 12
      },
      {
        name: 'Medium Risk', 
        value: Math.round((riskCounts.warning / totalSemesters) * 100 * 10) / 10,
        color: '#F59E0B',
        legendFontColor: '#374151',
        legendFontSize: 12
      },
      {
        name: 'High Risk',
        value: Math.round((riskCounts['at risk'] / totalSemesters) * 100 * 10) / 10,
        color: '#EF4444',
        legendFontColor: '#374151',
        legendFontSize: 12
      }
    ];

    // Create monthly trends (map semesters to months)
    const monthlyTrends = dashboard.map((record: any, index: number) => ({
      month: `Sem ${record.semester}`,
      gpa: record.gpa || 0,
      attendance: record.attendancePercentage || 0,
      riskScore: record.riskStatus === 'Safe' ? 10 : 
                 record.riskStatus === 'Warning' ? 50 : 90
    }));

    return {
      avgGpa: Math.round(avgGpa * 100) / 100,
      avgAttendance: Math.round(avgAttendance),
      gpaChange: Math.round(gpaChange * 10) / 10,
      attendanceChange: Math.round(attendanceChange * 10) / 10,
      riskDistribution,
      monthlyTrends,
      student,
      rawDashboard: dashboard // Keep original data for detailed views
    };
  }

  async getStudentProfile() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.makeRequest('/api/student/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Counselor Dashboard Methods
  async getCounselorDashboard() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await this.makeRequest('/api/counselor/dashboard', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Transform the response to match frontend expectations
    return this.transformCounselorDashboardData(response);
  }

  private transformCounselorDashboardData(backendResponse: any) {
    // Handle the backend response structure and transform it
    // This handles cases where the backend structure might be different
    
    if (!backendResponse) {
      throw new Error('No data received from backend');
    }

    // If the response is already in the expected format, return as-is
    if (backendResponse.counselor && backendResponse.students && backendResponse.summary) {
      return backendResponse;
    }

    // Otherwise, try to transform the data
    // This is a fallback transformation - adjust based on your actual backend structure
    const counselor = backendResponse.counselor || backendResponse.user || {
      userId: 'unknown',
      name: 'Unknown Counselor',
      department: 'Unknown Department'
    };

    const students = backendResponse.students || backendResponse.assignedStudents || [];
    
    // Calculate summary statistics
    const totalStudents = students.length;
    const avgGpa = totalStudents > 0 ? 
      students.reduce((sum: number, student: any) => sum + (student.currentGpa || 0), 0) / totalStudents : 0;
    const avgAttendance = totalStudents > 0 ? 
      students.reduce((sum: number, student: any) => sum + (student.currentAttendance || 0), 0) / totalStudents : 0;
    
    // Calculate risk distribution
    const riskCounts = { safe: 0, warning: 0, atRisk: 0 };
    students.forEach((student: any) => {
      const risk = (student.currentRiskStatus || '').toLowerCase();
      if (risk.includes('low') || risk.includes('safe')) {
        riskCounts.safe++;
      } else if (risk.includes('medium') || risk.includes('warning')) {
        riskCounts.warning++;
      } else if (risk.includes('high') || risk.includes('risk')) {
        riskCounts.atRisk++;
      }
    });

    const riskDistribution = {
      safe: totalStudents > 0 ? (riskCounts.safe / totalStudents) * 100 : 0,
      warning: totalStudents > 0 ? (riskCounts.warning / totalStudents) * 100 : 0,
      atRisk: totalStudents > 0 ? (riskCounts.atRisk / totalStudents) * 100 : 0,
    };

    return {
      counselor,
      students,
      summary: {
        totalStudents,
        avgGpa: Math.round(avgGpa * 100) / 100,
        avgAttendance: Math.round(avgAttendance),
        riskDistribution,
        riskCounts,
      }
    };
  }

  async getCounselorStudents() {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.makeRequest('/api/counselor/students', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async assignStudentsToCounselor(studentIds: string[]) {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.makeRequest('/api/counselor/students/assign', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ studentIds }),
    });
  }
}

export default new AuthService();
