"use client";
import React from "react";
import UserRow, { User, Team } from "./UserRow";

interface UserTableProps {
  users: User[];
  teams: Team[];
  onTeamSelect: (userId: number, teamId: string) => void;
  onAddToTeam: (userId: number) => void;
  onRemoveFromTeam: (userId: number, teamId: string) => void;
  onRoleChange: (userId: number, newRole: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  teams,
  onTeamSelect,
  onAddToTeam,
  onRemoveFromTeam,
  onRoleChange,
}) => (
  <table className="min-w-full table-auto">
    <thead className="bg-black">
      <tr>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          User
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Teams
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Assigned
        </th>
        <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
          Role
        </th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          teams={teams}
          onTeamSelect={onTeamSelect}
          onAddToTeam={onAddToTeam}
          onRemoveFromTeam={onRemoveFromTeam}
          onRoleChange={onRoleChange}
        />
      ))}
    </tbody>
  </table>
);

export default UserTable;
