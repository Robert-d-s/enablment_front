import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import userEvent from '@testing-library/user-event'

// Create a custom render function that includes providers
interface AllTheProvidersProps {
  children: ReactNode
  mocks?: MockedResponse[]
}

const AllTheProviders = ({ children, mocks = [] }: AllTheProvidersProps) => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mocks?: MockedResponse[]
}

const customRender = (
  ui: ReactElement,
  { mocks, ...options }: CustomRenderOptions = {}
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllTheProviders mocks={mocks}>{children}</AllTheProviders>
      ),
      ...options,
    }),
  }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockDate = (dateString: string) => new Date(dateString)

// Common test data
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'COLLABORATOR',
}

export const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test project description',
  isActive: true,
}

export const mockTeam = {
  id: '1',
  name: 'Test Team',
  description: 'Test team description',
}

export const mockRate = {
  id: 1,
  name: 'Standard Rate',
  rate: 100,
  teamId: '1',
}