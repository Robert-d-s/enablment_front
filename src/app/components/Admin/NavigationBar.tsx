"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { clientLogout } from "@/app/lib/apolloClient";
import { useAuthStore } from "@/app/lib/authStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

const NavigationBar: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await clientLogout();
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-card border-b font-roboto-condensed shadow-sm">
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="Enablment-tt Logo"
          width={180}
          height={36}
          priority
          className="h-[36px] w-auto max-w-[100px] sm:max-w-[180px] transition-all duration-200 ease-in-out"
        />
      </Link>

      <div className="hidden md:flex flex-grow items-center justify-center gap-6 font-medium text-sm uppercase">
        <Link
          href="/issuesPage"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Issues
        </Link>
        <Link
          href="/adminPage"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin
        </Link>
        <Link
          href="/timeKeeper"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Timekeeper
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              Loading...
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Optional User Info Label */}
              {user && (
                <>
                  <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Navigation Items */}
              <DropdownMenuItem asChild>
                <Link href="/issuesPage">Issues</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/adminPage">Admin</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/timeKeeper">Timekeeper</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Logout Item */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
