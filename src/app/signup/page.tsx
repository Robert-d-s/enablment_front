"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { SIGNUP_MUTATION } from "@/app/graphql/authOperations";

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

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      if (data.signup.success) {
        console.log("Signup successful. Redirecting to login...");
        router.push("/login");
      } else {
        setErrors({
          general: data.signup.message || "Signup failed. Please try again.",
        });
      }
    },
    onError: (error) => {
      console.error("Error during signup:", error);

      // Check for email already exists error
      if (error.message.includes("Email already exists")) {
        setErrors({
          ...errors,
          email: "Email already exists.",
        });
      } else {
        setErrors({
          ...errors,
          general: error.message || "An error occurred during signup.",
        });
      }
    },
  });

  const validateForm = () => {
    let valid = true;
    const newErrors: { email?: string; password?: string } = {};

    // Check if email is valid
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please provide a valid email address.";
      valid = false;
    }

    // Check if password is valid
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
        // Ensure this operation is identified as a signup request
        clientName: "Signup",
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
