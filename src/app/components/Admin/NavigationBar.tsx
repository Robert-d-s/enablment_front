"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clientLogout } from "@/app/lib/apolloClient";
import { useAuthStore } from "@/app/lib/authStore";
import { Button } from "@/components/ui/button";
import LoadingIndicator from "@/app/components/Admin/LoadingIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User as UserIcon } from "lucide-react";

const navLinks = [
  { href: "/issuesPage", label: "Issues" },
  { href: "/adminPage", label: "Admin" },
  { href: "/timeKeeper", label: "Timekeeper" },
];

const NavigationBar: React.FC = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await clientLogout();
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-card border-b font-roboto-condensed shadow-sm">
      <Link href="/" className="flex-shrink-0" tabIndex={0}>
        <Image
          src="/logo.svg"
          alt="Enablment-tt Logo"
          width={180}
          height={36}
          priority
          className="h-[36px] w-auto max-w-[100px] sm:max-w-[180px] transition-all duration-200 ease-in-out"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-grow items-center justify-center gap-6 font-medium text-sm uppercase">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            tabIndex={0}
            className={`
              transition-colors focus:outline-none
              focus:border-b-2 focus:border-blue-500
              ${pathname===link.href
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"}
            `}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          ) : (
            <div className="flex items-center h-5 w-24">
              <LoadingIndicator message="" size="sm" />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Logout"
            tabIndex={0}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                tabIndex={0}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
              {navLinks.map((link) => (
                <DropdownMenuItem asChild key={link.href}>
                  <Link
                    href={link.href}
                    tabIndex={0}
                    className={
                      pathname === link.href
                        ? "font-bold underline underline-offset-4"
                        : ""
                    }
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                tabIndex={0}
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