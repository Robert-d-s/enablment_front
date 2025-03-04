"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

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

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
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

      if (response.status === 409) {
        setErrors({
          ...errors,
          email: "Email already exists.",
        });
        return;
      }

      if (response.ok) {
        console.log("Signup successful. Redirecting to login...");
        router.push("/login");
      } else {
        console.error("Signup failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
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
            className="w-full bg-black text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4"
          >
            GET STARTED
          </button>
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
