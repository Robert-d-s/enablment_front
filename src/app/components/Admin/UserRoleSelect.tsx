"use client";
import React from "react";

export enum UserRole {
  ADMIN = "ADMIN",
  ENABLER = "ENABLER",
  COLLABORATOR = "COLLABORATOR",
  PENDING = "PENDING",
}

interface UserRoleSelectProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
}

const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  currentRole,
  onRoleChange,
}) => {
  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(e.target.value as UserRole)}
    >
      {Object.values(UserRole).map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default UserRoleSelect;
