import { renderHook, act } from '@testing-library/react'
import { useIssueFilters } from '../useIssueFilters'
import { useIssuesFilterStore } from '@/app/lib/issuesFilterStore'

const mockIssues = [
  {
    id: '1',
    title: 'Issue 1',
    teamName: 'Team A',
    assigneeName: 'John Doe',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Issue 2',
    teamName: 'Team B',
    assigneeName: 'Jane Smith',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Issue 3',
    teamName: 'Team A',
    assigneeName: 'John Doe',
    status: 'CLOSED',
    priority: 'LOW',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
  {
    id: '4',
    title: 'Issue 4',
    teamName: null,
    assigneeName: null,
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
  },
] as const

describe('useIssueFilters', () => {
  beforeEach(() => {
    // Clear filters before each test to ensure clean state
    useIssuesFilterStore.getState().clearFilters()
  })
  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    expect(result.current.selectedAssignee).toBe(null)
    expect(result.current.selectedTeam).toBe(null)
    expect(result.current.filteredIssues).toEqual(mockIssues)
  })

  it('should extract unique teams correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    expect(result.current.uniqueTeams).toEqual(['Team A', 'Team B'])
  })

  it('should extract unique assignees correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    expect(result.current.uniqueAssignees).toEqual(['Jane Smith', 'John Doe'])
  })

  it('should handle empty issues array', () => {
    const { result } = renderHook(() => useIssueFilters([]))

    expect(result.current.uniqueTeams).toEqual([])
    expect(result.current.uniqueAssignees).toEqual([])
    expect(result.current.filteredIssues).toEqual([])
  })

  it('should handle undefined issues', () => {
    const { result } = renderHook(() => useIssueFilters(undefined))

    expect(result.current.uniqueTeams).toEqual([])
    expect(result.current.uniqueAssignees).toEqual([])
    expect(result.current.filteredIssues).toEqual([])
  })

  it('should filter by team correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectTeam('Team A')
    })

    expect(result.current.selectedTeam).toBe('Team A')
    expect(result.current.filteredIssues).toHaveLength(2)
    expect(result.current.filteredIssues.every(issue => issue.teamName === 'Team A')).toBe(true)
  })

  it('should filter by assignee correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectAssignee('John Doe')
    })

    expect(result.current.selectedAssignee).toBe('John Doe')
    expect(result.current.filteredIssues).toHaveLength(2)
    expect(result.current.filteredIssues.every(issue => issue.assigneeName === 'John Doe')).toBe(true)
  })

  it('should filter by both team and assignee', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectTeam('Team A')
      result.current.handleSelectAssignee('John Doe')
    })

    expect(result.current.selectedTeam).toBe('Team A')
    expect(result.current.selectedAssignee).toBe('John Doe')
    expect(result.current.filteredIssues).toHaveLength(2)
    expect(
      result.current.filteredIssues.every(
        issue => issue.teamName === 'Team A' && issue.assigneeName === 'John Doe'
      )
    ).toBe(true)
  })

  it('should clear team filter when set to null', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectTeam('Team A')
    })

    expect(result.current.filteredIssues).toHaveLength(2)

    act(() => {
      result.current.handleSelectTeam(null)
    })

    expect(result.current.selectedTeam).toBe(null)
    expect(result.current.filteredIssues).toEqual(mockIssues)
  })

  it('should clear assignee filter when set to null', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectAssignee('John Doe')
    })

    expect(result.current.filteredIssues).toHaveLength(2)

    act(() => {
      result.current.handleSelectAssignee(null)
    })

    expect(result.current.selectedAssignee).toBe(null)
    expect(result.current.filteredIssues).toEqual(mockIssues)
  })

  it('should use setters directly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.setSelectedTeam('Team B')
      result.current.setSelectedAssignee('Jane Smith')
    })

    expect(result.current.selectedTeam).toBe('Team B')
    expect(result.current.selectedAssignee).toBe('Jane Smith')
    expect(result.current.filteredIssues).toHaveLength(1)
    expect(result.current.filteredIssues[0].id).toBe('2')
  })

  it('should return empty array when no issues match filters', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    act(() => {
      result.current.handleSelectTeam('Team A')
      result.current.handleSelectAssignee('Jane Smith')
    })

    expect(result.current.filteredIssues).toEqual([])
  })

  it('should handle issues with null team/assignee names correctly', () => {
    const { result } = renderHook(() => useIssueFilters(mockIssues))

    // The issue with null teamName and assigneeName should not appear in unique lists
    expect(result.current.uniqueTeams).not.toContain(null)
    expect(result.current.uniqueAssignees).not.toContain(null)

    // But it should appear in filtered results when no filter is applied
    expect(result.current.filteredIssues).toContain(mockIssues[3])

    // And should be filtered out when a team filter is applied
    act(() => {
      result.current.handleSelectTeam('Team A')
    })

    expect(result.current.filteredIssues).not.toContain(mockIssues[3])
  })

  it('should maintain stable callback references', () => {
    const { result, rerender } = renderHook(() => useIssueFilters(mockIssues))

    const initialHandleSelectTeam = result.current.handleSelectTeam
    const initialHandleSelectAssignee = result.current.handleSelectAssignee

    rerender()

    expect(result.current.handleSelectTeam).toBe(initialHandleSelectTeam)
    expect(result.current.handleSelectAssignee).toBe(initialHandleSelectAssignee)
  })
})