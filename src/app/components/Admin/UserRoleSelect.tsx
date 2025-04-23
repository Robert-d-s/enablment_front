"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export enum UserRole {
  ADMIN = "ADMIN",
  ENABLER = "ENABLER",
  COLLABORATOR = "COLLABORATOR",
  PENDING = "PENDING",
}

interface UserRoleSelectProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  disabled?: boolean;
  className?: string;
}

const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
  className,
}) => {
  return (
    <Select
      value={currentRole}
      onValueChange={(value) => onRoleChange(value as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select role..." />
      </SelectTrigger>
      <SelectContent>
        {Object.values(UserRole).map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserRoleSelect;
