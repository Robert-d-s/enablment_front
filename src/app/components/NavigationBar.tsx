"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { clientLogout } from "@/app/lib/apolloClient";
import { useAuthStore } from "../lib/authStore";
import useCurrentUser from "../hooks/useCurrentUser";

const NavigationBar: React.FC = () => {
  const { isLoading } = useCurrentUser();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    clientLogout();
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow font-roboto-condensed uppercase">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Enablment-tt Logo"
          width={200}
          height={40}
          style={{ cursor: "pointer" }}
        />
      </Link>
      <div className="flex-grow font-semibold text-lg mx-4 flex items-center justify-center">
        <Link href="/issuesPage" className="mr-4">
          Issues
        </Link>
        <Link href="/adminPage" className="mr-4">
          Admin
        </Link>
        <Link href="/timeKeeper">Timekeeper</Link>
      </div>
      <div>
        <div>
          <div
            className={
              user
                ? "bg-gray-800 text-white px-4 m-1 rounded"
                : "text-md text-gray-500"
            }
          >
            {user
              ? user.email
              : isLoading
              ? "Loading user data..."
              : "Not logged in"}
          </div>
        </div>
        <button
          className="bg-black text-white rounded hover:bg-gray-800 font-bold py-1 px-4 float-right font-roboto-condensed uppercase"
          style={{ fontSize: "12px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
