"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/app/graphql/authOperations";
import { useAuthStore } from "@/app/lib/authStore";
import client from "@/app/lib/apolloClient";

interface LoginData {
  login: {
    access_token: string;
    user: {
      id: number;
      email: string;
      role: string;
    };
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  // Get the combined setAuth action from the store
  const setAuth = useAuthStore((state) => state.setAuth);

  const [login, { loading }] = useMutation<LoginData>(LOGIN_MUTATION, {
    client: client, // Use the configured Apollo client
    onCompleted: (data) => {
      // Check if login data, token, AND user are present
      if (data?.login?.access_token && data?.login?.user) {
        const { access_token, user } = data.login;
        console.log("Login successful. Storing token and user data.");
        setAuth(access_token, user);
        // Redirect after successful state update
        router.push("/timeKeeper");
      } else {
        // Handle cases where backend response is missing expected data
        const errorMsg = "Login failed: Incomplete data received from server.";
        setErrorMessage(errorMsg);
        console.error(errorMsg, data);
      }
    },
    onError: (error) => {
      console.error("Login mutation error:", error);

      if (
        error.message.includes("Invalid email or password") ||
        error.message.includes("Unauthorized")
      ) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage(
          error.message || "An unexpected error occurred during login."
        );
      }
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    login({
      variables: {
        input: { email, password },
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <p className="text-gray-600 mb-1 text-center">WELCOME BACK</p>
        <h1 className="text-center text-2xl font-bold mb-4">
          Log In To Your Account
        </h1>

        <form onSubmit={handleLogin}>
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
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4 disabled:bg-gray-400"
          >
            {loading ? "LOGGING IN..." : "CONTINUE"}
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
