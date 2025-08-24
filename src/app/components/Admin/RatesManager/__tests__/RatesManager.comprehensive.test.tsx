import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import { MockedProvider } from '@apollo/client/testing'
import RatesManager from '../RatesManager'
import { GET_ALL_SIMPLE_TEAMS, GET_RATES } from '../queries'

// Mock the hooks to avoid complex dependency issues
jest.mock('../useRatesMutations', () => ({
  useRatesMutations: jest.fn(() => ({
    createRate: jest.fn().mockResolvedValue({}),
    deleteRate: jest.fn().mockResolvedValue({}),
    creatingRate: false,
  })),
}))

jest.mock('../useRatesForm', () => ({
  useRatesForm: jest.fn(() => ({
    rateName: '',
    rateValue: '',
    formError: null,
    setRateName: jest.fn(),
    handleRateValueChange: jest.fn(),
    validateForm: jest.fn().mockReturnValue(true),
    resetForm: jest.fn(),
  })),
}))

const mockTeams = [
  { id: '1', name: 'Development Team', description: 'Software development' },
  { id: '2', name: 'Design Team', description: 'UI/UX design' },
]

const mockRates = [
  { id: 1, name: 'Standard Rate', rate: 100, teamId: '1' },
  { id: 2, name: 'Senior Rate', rate: 150, teamId: '1' },
]

const createMocks = (includeRates = false) => [
  {
    request: {
      query: GET_ALL_SIMPLE_TEAMS,
    },
    result: {
      data: {
        getAllSimpleTeams: mockTeams,
      },
    },
  },
  ...(includeRates ? [{
    request: {
      query: GET_RATES,
      variables: { teamId: '1' },
    },
    result: {
      data: {
        rates: mockRates,
      },
    },
  }] : []),
]

describe('RatesManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the rates manager title and structure', async () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    expect(screen.getByTestId('card-title')).toHaveTextContent('Manage Rates')
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('card-header')).toBeInTheDocument()
    expect(screen.getByTestId('card-content')).toBeInTheDocument()
  })

  it('should show "select a team" message when no team is selected', async () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Select a team to view and manage rates.')).toBeInTheDocument()
    })
  })

  it('should render the existing rates section header', () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    expect(screen.getByText('Existing Rates for Team:')).toBeInTheDocument()
  })

  it('should render team selector component', async () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    // TeamSelector should render a select component
    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument()
    })
  })

  it('should handle loading state for teams', () => {
    const loadingMocks = [
      {
        request: {
          query: GET_ALL_SIMPLE_TEAMS,
        },
        result: {
          data: {
            getAllSimpleTeams: mockTeams,
          },
        },
        delay: 100,
      },
    ]

    render(
      <MockedProvider mocks={loadingMocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    // Should render the component structure even during loading
    expect(screen.getByTestId('card-title')).toHaveTextContent('Manage Rates')
  })

  it('should handle error state for teams', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_ALL_SIMPLE_TEAMS,
        },
        error: new Error('Failed to fetch teams'),
      },
    ]

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    // Component should still render despite error
    expect(screen.getByTestId('card-title')).toHaveTextContent('Manage Rates')
  })

  it('should pass correct props to TeamSelector', async () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    await waitFor(() => {
      const selectComponent = screen.getByTestId('select')
      expect(selectComponent).toBeInTheDocument()
      // The select should initially show no selection
      expect(selectComponent).toHaveAttribute('data-value', '')
    })
  })

  it('should render rates list section', () => {
    const mocks = createMocks()

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RatesManager />
      </MockedProvider>
    )

    expect(screen.getByText('Existing Rates for Team:')).toBeInTheDocument()
  })

  describe('component integration', () => {
    it('should integrate all child components correctly', async () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      // Main structure
      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByTestId('card-title')).toHaveTextContent('Manage Rates')

      // TeamSelector should be rendered
      await waitFor(() => {
        expect(screen.getByTestId('select')).toBeInTheDocument()
      })

      // Rates section should be rendered
      expect(screen.getByText('Existing Rates for Team:')).toBeInTheDocument()
      expect(screen.getByText('Select a team to view and manage rates.')).toBeInTheDocument()
    })

    it('should maintain proper component hierarchy', () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      const card = screen.getByTestId('card')
      const cardHeader = screen.getByTestId('card-header')
      const cardContent = screen.getByTestId('card-content')

      expect(card).toContainElement(cardHeader)
      expect(card).toContainElement(cardContent)
      expect(cardHeader).toContainElement(screen.getByTestId('card-title'))
    })
  })

  describe('state management', () => {
    it('should start with empty team selection', () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      const selectComponent = screen.getByTestId('select')
      expect(selectComponent).toHaveAttribute('data-value', '')
    })

    it('should handle processing states correctly', () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      // Component should render without processing states initially
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })
  })

  describe('accessibility and UX', () => {
    it('should have proper semantic structure', () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      // Should have proper heading structure
      const title = screen.getByTestId('card-title')
      expect(title.tagName).toBe('H1')
      expect(title).toHaveTextContent('Manage Rates')

      // Should have proper card structure
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('should provide clear user guidance', () => {
      const mocks = createMocks()

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <RatesManager />
        </MockedProvider>
      )

      expect(screen.getByText('Select a team to view and manage rates.')).toBeInTheDocument()
      expect(screen.getByText('Existing Rates for Team:')).toBeInTheDocument()
    })
  })
})