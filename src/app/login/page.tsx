"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchUserProfile } from "@/app/lib/apolloClient";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      if (data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        await fetchUserProfile(data.access_token);
        router.push("/timeKeeper");
      } else if (data && data.error) {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <p className="text-gray-600 mb-1 text-center">WELCOME BACK</p>
        <h1 className="text-center text-2xl font-bold mb-4">
          Log In To Your Account
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            className="mb-2 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="mb-4 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4"
          >
            CONTINUE
          </button>

          <div className="text-center">
            <p className=" cursor-pointer ">
              New User ?{" "}
              <Link href="/signup" className="text-blue-500">
                SIGN UP HERE
              </Link>
            </p>
          </div>

          {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
        </form>
        <div className="flex justify-end items-end mt-20">
          <Image
            src="/logo.svg"
            alt="Enablment-tt Logo"
            width={150}
            height={40}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
