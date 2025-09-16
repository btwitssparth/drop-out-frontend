import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API base URL - change this to your backend IP when running on device
const API_BASE_URL = 'http://localhost:5000';

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

    const response = await this.makeRequest('/api/dashboard', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Return the data field from the response
    return response.data || response;
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
}

export default new AuthService();
