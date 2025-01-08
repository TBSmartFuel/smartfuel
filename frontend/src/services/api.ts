import axios, { AxiosError } from 'axios';
import { User, Question, MealPlan, UserInfo, QuestionResponse } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);  // OAuth2 expects 'username' field
      formData.append('password', password);

      const response = await api.post<LoginResponse>('/users/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Store the token
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 && error.response.data.detail) {
          throw new Error(error.response.data.detail);
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password');
        }
      }
      throw new Error('Login failed. Please try again.');
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },

  register: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<User>('/users/register', { email, password });
      return {
        ...response.data,
        message: response.data.message
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data.detail || 'Registration failed');
        }
      }
      throw new Error('Registration failed. Please try again.');
    }
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
};

// Questions endpoints
export const questionsApi = {
  getQuestions: async (): Promise<Question[]> => {
    try {
      const response = await api.get<Question[]>('/questions');
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error('Questions endpoint not found. Please check your API configuration.');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to the server. Please check if the backend is running.');
        }
      }
      throw new Error('Failed to fetch questions. Please try again later.');
    }
  },
  
  getUserResponses: async (): Promise<QuestionResponse[]> => {
    try {
      const response = await api.get<QuestionResponse[]>('/questions/user-responses');
      return response.data;
    } catch (error) {
      console.error('Error fetching user responses:', error);
      // Don't throw error for responses - just return empty array if not found
      return [];
    }
  },
  
  saveResponses: async (responses: QuestionResponse[]): Promise<void> => {
    try {
      await api.post('/questions/responses', { responses });
    } catch (error) {
      console.error('Error saving responses:', error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        throw new Error('Please log in to save your responses.');
      }
      throw new Error('Failed to save responses. Please try again.');
    }
  },
  
  submitResponses: async (userInfo: UserInfo, responses: QuestionResponse[]) => {
    try {
      const response = await api.post('/meal-plans/generate', { user_info: userInfo, responses });
      return response.data;
    } catch (error) {
      console.error('Error submitting responses:', error);
      throw error;
    }
  },
};

// Admin endpoints
export const adminApi = {
  // User management
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/all');
    return response.data;
  },

  toggleUserAdmin: async (userId: number): Promise<User> => {
    const response = await api.put(`/users/toggle-admin/${userId}`);
    return response.data;
  },

  // Question management
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/admin/questions');
    return response.data;
  },

  createQuestion: async (question: Omit<Question, 'id'>): Promise<Question> => {
    const response = await api.post('/admin/questions', question);
    return response.data;
  },

  updateQuestion: async (id: number, question: Omit<Question, 'id'>): Promise<Question> => {
    const response = await api.put(`/admin/questions/${id}`, question);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },

  reorderQuestions: async (questionOrders: { id: number; order: number }[]): Promise<void> => {
    await api.post('/admin/questions/reorder', questionOrders);
  },

  // Statistics
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getActivityData: async (timeRange: string) => {
    try {
      const response = await api.get('/admin/questions/stats', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  },

  getQuestionCategoryDistribution: async () => {
    try {
      const response = await api.get('/admin/meal-plans/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plan stats:', error);
      throw error;
    }
  },

  // System Prompts
  getAllSystemPrompts: () => api.get('/admin/system-prompts'),
  getSystemPrompt: (id: number) => api.get(`/admin/system-prompts/${id}`),
  createSystemPrompt: (data: {
    name: string;
    prompt_text: string;
    output_format?: string;
    description?: string;
  }) => api.post('/admin/system-prompts', data),
  updateSystemPrompt: (id: number, data: {
    name?: string;
    prompt_text?: string;
    output_format?: string;
    description?: string;
    is_active?: boolean;
  }) => api.put(`/admin/system-prompts/${id}`, data),
  deleteSystemPrompt: (id: number) => api.delete(`/admin/system-prompts/${id}`),
  toggleSystemPromptActive: (id: number) => api.post(`/admin/system-prompts/${id}/toggle-active`),
};

// Meal Plan endpoints
export const mealPlanApi = {
  getMealPlans: async () => {
    try {
      const response = await api.get('/meal-plans');
      console.log('Get Meal Plans Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  },

  getMealPlan: async (id: string) => {
    try {
      const response = await api.get(`/meal-plans/${id}`);
      console.log('Get Single Meal Plan Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  },

  generateMealPlan: async (data: any) => {
    try {
      const response = await api.post('/meal-plans/generate', data);
      console.log('Generate Meal Plan Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  },

  deleteMealPlan: async (id: number) => {
    try {
      await api.delete(`/meal-plans/${id}`);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }
};

export default api; 