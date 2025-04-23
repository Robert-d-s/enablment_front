"use client";
import React from "react";
import UserRow, { User, Team } from "./UserRow";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

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
    <Table>
      <TableCaption>A list of users and their teams/roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30%]">User</TableHead>
          <TableHead>Team Management</TableHead>
          <TableHead className="w-[150px]">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              allTeams={allTeams}
              loggedInUserId={loggedInUserId}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              No users found matching criteria.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
