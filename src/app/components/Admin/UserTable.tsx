"use client";
import React from "react";
import UserRow, { User, Team } from "./UserRow";

interface UserTableProps {
  users: User[];
  allTeams: Team[];
  loggedInUserId: number | undefined;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  allTeams,
  loggedInUserId,
}) => {
  return (
    <table className="min-w-full table-auto">
      <thead className="bg-black">
        <tr>
          <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-lg font-medium text-white uppercase tracking-wider">
            Team Management
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
            allTeams={allTeams}
            loggedInUserId={loggedInUserId}
          />
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
