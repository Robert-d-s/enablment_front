import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { useCurrentUser } from '../useCurrentUser'
import { useAuthStore } from '@/app/lib/authStore'
import { ME_QUERY } from '@/generated/graphql'

// Mock the auth store
jest.mock('@/app/lib/authStore', () => ({
  useAuthStore: jest.fn(),
}))

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'COLLABORATOR',
}

const createMeQueryMock = (user: any = mockUser, error: any = null) => ({
  request: {
    query: ME_QUERY,
  },
  result: error ? { errors: [error] } : { data: { me: user } },
})

describe('useCurrentUser', () => {
  const mockSetUser = jest.fn()
  const mockLogout = jest.fn()
  const mockSetState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock useAuthStore.setState
    ;(useAuthStore as any).setState = mockSetState
    ;(useAuthStore as any).getState = jest.fn(() => ({ logout: mockLogout }))
  })

  it('should return currentUser from store when available', async () => {
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      accessToken: 'valid-token',
      isAuthenticated: true,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const mocks = [createMeQueryMock(mockUser)]

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    expect(result.current.currentUser).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(true) // Initially loading
  })

  it('should skip query when no access token', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    expect(result.current.currentUser).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('should set user when query completes successfully', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'valid-token',
      isAuthenticated: false,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const mocks = [createMeQueryMock(mockUser)]

    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser)
    })
  })

  it('should logout when query returns null user', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'valid-token',
      isAuthenticated: true,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const mocks = [createMeQueryMock(null)]

    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('should logout on unauthorized error', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'invalid-token',
      isAuthenticated: true,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const unauthorizedError = {
      message: 'Unauthorized',
      extensions: { code: 'UNAUTHORIZED' },
    }

    const mocks = [createMeQueryMock(null, unauthorizedError)]

    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('should logout on network 401 error', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'invalid-token',
      isAuthenticated: true,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const networkError = { message: '401 Unauthorized' }
    const mocks = [
      {
        request: { query: ME_QUERY },
        networkError,
      },
    ]

    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  it('should set isAuthenticated to true when user data is received and not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'valid-token',
      isAuthenticated: false,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const mocks = [createMeQueryMock(mockUser)]

    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(mockSetState).toHaveBeenCalledWith({ isAuthenticated: true })
    })
  })

  it('should return query data when store user is not available', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: 'valid-token',
      isAuthenticated: true,
      setUser: mockSetUser,
      logout: mockLogout,
    })

    const mocks = [createMeQueryMock(mockUser)]

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
          {children}
        </MockedProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(mockUser)
    })
  })
})