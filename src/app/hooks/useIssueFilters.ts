import { useMemo, useCallback } from "react";
import { type GetIssuesQuery } from "@/generated/graphql";
import { useIssuesFilterStore } from "@/app/lib/issuesFilterStore";

// Use the generated Issue type
type Issue = GetIssuesQuery["issues"]["issues"][0];

interface UseIssueFiltersReturn {
  selectedAssignee: string | null;
  setSelectedAssignee: (assignee: string | null) => void;
  selectedTeam: string | null;
  setSelectedTeam: (team: string | null) => void;
  uniqueTeams: string[];
  uniqueAssignees: string[];
  filteredIssues: Issue[];
  handleSelectAssignee: (assignee: string | null) => void;
  handleSelectTeam: (team: string | null) => void;
}

export const useIssueFilters = (issues?: Issue[]): UseIssueFiltersReturn => {
  const { selectedAssignee, selectedTeam, setSelectedAssignee, setSelectedTeam } = useIssuesFilterStore();

  const handleSelectAssignee = useCallback((assignee: string | null) => {
    setSelectedAssignee(assignee);
  }, [setSelectedAssignee]);

  const handleSelectTeam = useCallback((team: string | null) => {
    setSelectedTeam(team);
  }, [setSelectedTeam]);

  const uniqueTeams = useMemo(() => {
    if (!issues) return [];
    const teams = new Set<string>();
    issues.forEach((issue) => {
      if (issue.teamName) teams.add(issue.teamName);
    });
    return Array.from(teams).sort(); // Added sort for consistent ordering
  }, [issues]);

  const uniqueAssignees = useMemo(() => {
    if (!issues) return [];
    const assignees = new Set<string>();
    issues.forEach((issue) => {
      if (issue.assigneeName) assignees.add(issue.assigneeName);
    });
    return Array.from(assignees).sort();
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter((issue) => {
      const teamMatch = !selectedTeam || issue.teamName === selectedTeam;
      const assigneeMatch =
        !selectedAssignee || issue.assigneeName === selectedAssignee;
      return teamMatch && assigneeMatch;
    });
  }, [issues, selectedTeam, selectedAssignee]);

  return {
    selectedAssignee,
    setSelectedAssignee,
    selectedTeam,
    setSelectedTeam,
    uniqueTeams,
    uniqueAssignees,
    filteredIssues,
    handleSelectAssignee,
    handleSelectTeam,
  };
};
