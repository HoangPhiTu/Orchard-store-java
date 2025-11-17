import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDTO, AuthResponseDTO } from '@/types/auth';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: UserDTO) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, rememberMe: boolean = false) => {
        set({ isLoading: true });
        try {
          const response: AuthResponseDTO = await authApi.login({ email, password, rememberMe });
          
          const user: UserDTO = {
            id: response.id,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          };

          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: UserDTO) => {
        set({ user, isAuthenticated: true });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token invalid, clear auth
          authApi.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

