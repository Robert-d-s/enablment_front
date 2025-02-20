"use client";
import React from "react";
import UserRoleSelect, { UserRole } from "./UserRoleSelect";

export interface Team {
  id: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  teams: Team[];
}

interface UserRowProps {
  user: User;
  teams: Team[];
  onTeamSelect: (userId: number, teamId: string) => void;
  onAddToTeam: (userId: number) => void;
  onRemoveFromTeam: (userId: number, teamId: string) => void;
  onRoleChange: (userId: number, newRole: UserRole) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  teams,
  onTeamSelect,
  onAddToTeam,
  onRemoveFromTeam,
  onRoleChange,
}) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        {/* Inline team select (skipping separate TeamSelect file) */}
        <select onChange={(e) => onTeamSelect(user.id, e.target.value)}>
          <option value="">Select team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button
          className="ml-20 bg-black hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => onAddToTeam(user.id)}
        >
          Add to Team
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 shadow-md">
        {user.teams && user.teams.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {user.teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between border-b border-gray-200"
              >
                {team.name}
                <button
                  onClick={() => onRemoveFromTeam(user.id, team.id)}
                  className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded border-b border-gray-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No teams assigned</p>
        )}
      </td>
      <td className="border-b border-gray-200 shadow-md">
        <UserRoleSelect
          currentRole={user.role}
          onRoleChange={(newRole) => onRoleChange(user.id, newRole)}
        />
      </td>
    </tr>
  );
};

export default UserRow;
