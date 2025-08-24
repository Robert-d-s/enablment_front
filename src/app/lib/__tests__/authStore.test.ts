import { useAuthStore } from '../authStore'

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { logout } = useAuthStore.getState()
    logout()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      
      expect(state.accessToken).toBe(null)
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isForbidden).toBe(false)
    })
  })

  describe('authentication actions', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'COLLABORATOR',
    }

    it('should set authentication with token and user', () => {
      const { setAuth } = useAuthStore.getState()
      const token = 'test-token'
      
      setAuth(token, mockUser)
      
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(token)
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isForbidden).toBe(false)
    })

    it('should logout user and clear all data', () => {
      const { setAuth, logout } = useAuthStore.getState()
      
      // First set authentication
      setAuth('token', mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      
      // Then logout
      logout()
      
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(null)
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
      expect(state.isForbidden).toBe(false)
    })

    it('should update access token', () => {
      const { setAuth, setAccessToken } = useAuthStore.getState()
      
      // Initial auth
      setAuth('old-token', mockUser)
      
      // Update token
      const newToken = 'new-token'
      setAccessToken(newToken)
      
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(newToken)
      expect(state.user).toEqual(mockUser) // User data preserved
      expect(state.isAuthenticated).toBe(true)
    })

    it('should update user information', () => {
      const { setAuth, setUser } = useAuthStore.getState()
      
      // Initial auth
      setAuth('token', mockUser)
      
      // Update user
      const updatedUser = { ...mockUser, role: 'ADMIN' }
      setUser(updatedUser)
      
      const state = useAuthStore.getState()
      expect(state.user).toEqual(updatedUser)
      expect(state.accessToken).toBe('token') // Token preserved
      expect(state.isAuthenticated).toBe(true)
    })

    it('should set forbidden state', () => {
      const { setForbidden } = useAuthStore.getState()
      
      setForbidden(true)
      expect(useAuthStore.getState().isForbidden).toBe(true)
      
      setForbidden(false)
      expect(useAuthStore.getState().isForbidden).toBe(false)
    })
  })

  describe('authentication state computed properties', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'COLLABORATOR',
    }

    it('should correctly compute isAuthenticated when logged in', () => {
      const { setAuth } = useAuthStore.getState()
      
      setAuth('token', mockUser)
      
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should correctly compute isAuthenticated when not logged in', () => {
      // Initial state should be not authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      
      // After logout should also be not authenticated
      const { setAuth, logout } = useAuthStore.getState()
      setAuth('token', mockUser)
      logout()
      
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should be authenticated with token even without user', () => {
      const { setAccessToken } = useAuthStore.getState()
      
      setAccessToken('token')
      
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toBe(null)
    })

    it('should not be authenticated with null token', () => {
      const { setAccessToken } = useAuthStore.getState()
      
      setAccessToken(null)
      
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle null tokens in setAuth', () => {
      const { setAuth } = useAuthStore.getState()
      
      setAuth(null, null)
      
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(null)
      expect(state.user).toBe(null)
      expect(state.isAuthenticated).toBe(false)
    })

    it('should handle null user in setUser', () => {
      const { setAuth, setUser } = useAuthStore.getState()
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'COLLABORATOR',
      }
      
      setAuth('token', mockUser)
      expect(useAuthStore.getState().user).toEqual(mockUser)
      
      setUser(null)
      expect(useAuthStore.getState().user).toBe(null)
      expect(useAuthStore.getState().isAuthenticated).toBe(true) // Still authenticated due to token
    })

    it('should handle empty string token', () => {
      const { setAccessToken } = useAuthStore.getState()
      
      setAccessToken('')
      
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe('')
      expect(state.isAuthenticated).toBe(false) // Empty string is falsy
    })
  })

  describe('persistence and state management', () => {
    it('should maintain state across multiple store accesses', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'COLLABORATOR',
      }

      const { setAuth } = useAuthStore.getState()
      setAuth('token', mockUser)

      // Access store again
      const newState = useAuthStore.getState()
      expect(newState.accessToken).toBe('token')
      expect(newState.user).toEqual(mockUser)
      expect(newState.isAuthenticated).toBe(true)
    })

    it('should handle rapid state changes', () => {
      const { setAuth, logout, setAccessToken } = useAuthStore.getState()
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'COLLABORATOR',
      }

      // Rapid sequence of state changes
      setAuth('token1', mockUser)
      setAccessToken('token2')
      logout()
      setAuth('token3', mockUser)

      const finalState = useAuthStore.getState()
      expect(finalState.accessToken).toBe('token3')
      expect(finalState.user).toEqual(mockUser)
      expect(finalState.isAuthenticated).toBe(true)
    })
  })

  describe('forbidden state management', () => {
    it('should handle forbidden state changes', () => {
      const { setAuth, setForbidden } = useAuthStore.getState()
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'COLLABORATOR',
      }

      setAuth('token', mockUser)
      expect(useAuthStore.getState().isForbidden).toBe(false)

      setForbidden(true)
      expect(useAuthStore.getState().isForbidden).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true) // Should remain authenticated

      setForbidden(false)
      expect(useAuthStore.getState().isForbidden).toBe(false)
    })

    it('should clear forbidden state on logout', () => {
      const { setAuth, setForbidden, logout } = useAuthStore.getState()
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'COLLABORATOR',
      }

      setAuth('token', mockUser)
      setForbidden(true)
      expect(useAuthStore.getState().isForbidden).toBe(true)

      logout()
      expect(useAuthStore.getState().isForbidden).toBe(false)
    })
  })
})