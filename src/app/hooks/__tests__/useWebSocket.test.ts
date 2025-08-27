import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'
import { useAuthStore } from '@/app/lib/authStore'
import { io } from 'socket.io-client'

// Mock socket.io-client
jest.mock('socket.io-client')
const mockIo = io as jest.MockedFunction<typeof io>

// Mock the auth store
jest.mock('@/app/lib/authStore', () => ({
  useAuthStore: jest.fn(),
}))

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

// Mock socket instance
const createMockSocket = () => ({
  id: 'socket-id-123',
  connected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  removeAllListeners: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
})

describe('useWebSocket', () => {
  const mockOnIssueUpdate = jest.fn()
  const wsUrl = 'ws://localhost:3000'
  let mockSocket: ReturnType<typeof createMockSocket>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockSocket = createMockSocket()
    mockIo.mockReturnValue(mockSocket as any)

    // Console.log and console.error should be mocked to avoid noise
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('should not connect without access token', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: null })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    expect(mockIo).not.toHaveBeenCalled()
    expect(result.current.socketConnected).toBe(false)
    expect(result.current.connectionStatusMessage).toBe('Not authenticated')
    expect(result.current.socket).toBe(null)
  })

  it('should not connect without wsUrl', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl: '',
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    expect(mockIo).not.toHaveBeenCalled()
    expect(result.current.socketConnected).toBe(false)
    expect(result.current.connectionStatusMessage).toBe('WebSocket URL not provided')
    expect(result.current.socket).toBe(null)
  })

  it('should create socket with correct configuration', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    renderHook(() =>
      useWebSocket({
        wsUrl,
        maxReconnectAttempts: 3,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    expect(mockIo).toHaveBeenCalledWith(wsUrl, {
      transports: ['websocket'],
      path: '/socket.io',
      reconnection: false,
      timeout: 10000,
      withCredentials: true,
      auth: { token: 'test-token' },
      extraHeaders: { Authorization: 'Bearer test-token' },
    })

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('issueUpdate', mockOnIssueUpdate)
  })

  it('should handle successful connection', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    // Simulate connect event
    const connectHandler = mockSocket.on.mock.calls.find(([event]) => event === 'connect')?.[1]
    act(() => {
      connectHandler()
    })

    expect(result.current.socketConnected).toBe(true)
    expect(result.current.connectionStatusMessage).toBe('Live Updates On')
  })

  it('should handle connection error and retry', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        maxReconnectAttempts: 2,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    // Simulate connect_error event
    const connectErrorHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'connect_error'
    )?.[1]
    
    act(() => {
      connectErrorHandler(new Error('Connection failed'))
    })

    expect(mockSocket.disconnect).toHaveBeenCalled()
    expect(result.current.socketConnected).toBe(false)
    expect(result.current.connectionStatusMessage).toContain('Connection Error')

    // Check that retry is scheduled
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number))

    // Advance timers to trigger retry
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Should attempt to create a new socket
    expect(mockIo).toHaveBeenCalledTimes(2)
  })

  it('should stop retrying after max attempts', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        maxReconnectAttempts: 1,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    // Simulate connection error
    const connectErrorHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'connect_error'
    )?.[1]

    act(() => {
      connectErrorHandler(new Error('Connection failed'))
    })

    // Advance timers to trigger retry (which should be the max attempt)
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Simulate another error on retry
    const retrySocket = createMockSocket()
    mockIo.mockReturnValue(retrySocket as any)
    const retryConnectErrorHandler = retrySocket.on.mock.calls.find(
      ([event]) => event === 'connect_error'
    )?.[1]

    act(() => {
      retryConnectErrorHandler(new Error('Connection failed again'))
    })

    expect(result.current.connectionStatusMessage).toBe('Connection failed (Max attempts)')
  })

  it('should handle disconnect and attempt reconnection', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        maxReconnectAttempts: 2,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    // First connect successfully
    const connectHandler = mockSocket.on.mock.calls.find(([event]) => event === 'connect')?.[1]
    act(() => {
      connectHandler()
    })

    expect(result.current.socketConnected).toBe(true)

    // Then disconnect unexpectedly
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )?.[1]
    
    act(() => {
      disconnectHandler('transport close')
    })

    expect(result.current.socketConnected).toBe(false)
    expect(result.current.connectionStatusMessage).toBe('Disconnected. Retrying...')

    // Should schedule reconnection
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), expect.any(Number))
  })

  it('should handle client-initiated disconnect without retry', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { result } = renderHook(() =>
      useWebSocket({
        wsUrl,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    // Simulate client disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )?.[1]
    
    act(() => {
      disconnectHandler('io client disconnect')
    })

    expect(result.current.socketConnected).toBe(false)
    expect(result.current.connectionStatusMessage).toBe('Disconnected by client')
    
    // Should not schedule retry for client-initiated disconnect
    expect(setTimeout).not.toHaveBeenCalled()
  })

  it('should clean up socket on unmount', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    const { unmount } = renderHook(() =>
      useWebSocket({
        wsUrl,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    unmount()

    expect(mockSocket.removeAllListeners).toHaveBeenCalled()
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('should recreate socket when access token changes', () => {
    const mockUseAuthStoreFunction = jest.fn()
    mockUseAuthStoreFunction.mockReturnValueOnce({ accessToken: 'token1' })
    mockUseAuthStore.mockImplementation(mockUseAuthStoreFunction)

    const { rerender } = renderHook(() =>
      useWebSocket({
        wsUrl,
        onIssueUpdate: mockOnIssueUpdate,
      })
    )

    expect(mockIo).toHaveBeenCalledTimes(1)

    // Change the token - need to mock the store to return different values
    mockUseAuthStore.mockReturnValue({ accessToken: 'token2' })
    rerender()

    expect(mockSocket.removeAllListeners).toHaveBeenCalled()
    expect(mockSocket.disconnect).toHaveBeenCalled()
    expect(mockIo).toHaveBeenCalledTimes(2)
  })

  it('should not register issueUpdate handler if onIssueUpdate is not provided', () => {
    mockUseAuthStore.mockReturnValue({ accessToken: 'test-token' })

    renderHook(() =>
      useWebSocket({
        wsUrl,
      })
    )

    const issueUpdateCall = mockSocket.on.mock.calls.find(
      ([event]) => event === 'issueUpdate'
    )
    expect(issueUpdateCall).toBeUndefined()
  })
})