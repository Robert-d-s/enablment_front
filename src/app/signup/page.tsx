"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "@/app/graphql/authOperations";
import { useAuthStore } from "@/app/lib/authStore";

interface SignUpData {
  signup: {
    access_token: string;
    user: {
      id: number;
      email: string;
      role: string;
    };
  };
}

interface ValidationErrorOriginalError {
  message?: string | string[];
}

interface GraphQLErrorExtensions {
  code?: string;
  originalError?: ValidationErrorOriginalError;
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  const setAuth = useAuthStore((state) => state.setAuth);

  const [signup, { loading }] = useMutation<SignUpData>(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      if (data?.signup?.access_token && data?.signup?.user) {
        console.log("Signup successful. Redirecting to login...");
        setAuth(data.signup.access_token, data.signup.user);
        router.push("/timeKeeper");
      } else {
        console.error("Signup completed but response data is missing.", data);
        setErrors({
          general:
            "Signup process incomplete. Please try logging in or contact support.",
        });
      }
    },
    onError: (error) => {
      console.error("Error during signup:", error);

      if (error.message.includes("Email already exists")) {
        setErrors({
          ...errors,
          email: "Email already exists.",
        });
      } else if (
        error.graphQLErrors?.some(
          (e) => e.extensions?.code === "BAD_USER_INPUT"
        )
      ) {
        // Handle potential validation errors from backend ValidationPipe
        const validationError = error.graphQLErrors.find(
          (e) => e.extensions?.code === "BAD_USER_INPUT"
        );
        const extensions = validationError?.extensions as
          | GraphQLErrorExtensions
          | undefined;
        let extractedMessage: string | undefined = undefined;
        const originalMsg = extensions?.originalError?.message;

        if (Array.isArray(originalMsg)) {
          extractedMessage = originalMsg.join(", ");
        } else if (typeof originalMsg === "string") {
          extractedMessage = originalMsg;
        }
        setErrors({
          general: `Signup failed: ${extractedMessage || "Invalid input."}`,
        });
      } else {
        setErrors({
          ...errors,
          general: error.message || "An error occurred during signup.",
        });
      }
    },
    context: {
      credentials: "include",
    },
  });

  const validateForm = () => {
    let valid = true;
    const newErrors: { email?: string; password?: string } = {};

    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please provide a valid email address.";
      valid = false;
    }

    if (!password || !passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters long, have at least one uppercase letter, and one special character.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    signup({
      variables: {
        input: {
          email,
          password,
        },
      },
      context: {
        credentials: "include",
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-center text-2xl font-bold mb-4">
          Create an Account
        </h2>
        <form onSubmit={handleSignup}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mb-2 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-2 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4 disabled:bg-gray-400"
          >
            {loading ? "CREATING ACCOUNT..." : "GET STARTED"}
          </button>
          {errors.general && (
            <p className="text-red-500 text-sm mb-4">{errors.general}</p>
          )}
        </form>
        <div className="flex justify-center">
          <span>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500">
              LOGIN HERE
            </Link>
          </span>
        </div>
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

export default Signup;
