import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Team } from "./types";

interface TeamSelectorProps {
  selectedTeamId: string;
  onTeamChange: (teamId: string) => void;
  teams: Team[] | undefined;
  loading: boolean;
  error?: Error | null;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeamId,
  onTeamChange,
  teams,
  loading,
  error,
}) => {
  return (
    <div className="mb-4">
      <Label
        htmlFor="teamSelectorRates"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Select Team
      </Label>
      <Select
        value={selectedTeamId}
        onValueChange={onTeamChange}
        disabled={loading}
      >
        <SelectTrigger
          id="teamSelectorRates"
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        >
          <SelectValue
            placeholder={loading ? "Loading Teams..." : "-- Select a Team --"}
          />
        </SelectTrigger>
        <SelectContent>
          {teams?.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
