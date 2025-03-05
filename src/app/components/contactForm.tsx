"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string; message: string }) => void;
  onClose: () => void;
  className?: string;
  isOverlay?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  onClose,
  className = "",
  isOverlay = true,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formContent = (
    <div className="bg-white flex gap-4 rounded-lg shadow-lg p-8 m-4 lg:w-10/12 max-h-full overflow-y-auto contact-form-container">
      <div>
        <video
          width="100%"
          height="auto"
          className="rounded-lg lazy"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src="/video/email.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="flex justify-between ">
          <div className="text-sm mt-4 w-1/2">
            <p>Øster Allé 56 6. sal</p>
            <p>2100 København Ø</p>
            <p>CVR: 42309648</p>
            <div className="lg:mt-6 flex flex-col space-y-2 lg:flex-row sm:mt-2 sm:space-y-0 lg:space-x-2 CandP">
              <a href="#" className="text-blue-700 hover:underline">
                Cookie policy
              </a>
              <span className="hidden lg:inline">•</span>
              <a href="#" className="text-blue-700 hover:underline">
                Privacy policy
              </a>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex mt-4">
              <span className="mr-3">
                <Image
                  src="/icons/instagram.svg"
                  alt="instagram"
                  width={24}
                  height={24}
                />
              </span>
              <span className="mr-3">
                <Image
                  src="/icons/facebook.svg"
                  alt="facebook"
                  width={24}
                  height={24}
                />
              </span>
              <span className="mr-4">
                <Image
                  src="/icons/linkedin.svg"
                  alt="linkedin"
                  width={24}
                  height={24}
                />
              </span>
              <span>
                <Image
                  src="/icons/twitter.svg"
                  alt="twitter"
                  width={24}
                  height={24}
                />
              </span>
            </div>
            <div className="flex gap-1 items-center mt-4">
              <span className="text-green-700">(+45) 22 92 67 80</span>
              <Image
                src="/icons/phone.svg"
                alt="call"
                width={24}
                height={24}
                className="align-middle"
              />
            </div>
            <div className="flex gap-1 items-center ">
              <span className="text-green-700 mb-1">gd@enablment.com</span>
              <Image
                src="/icons/mail.svg"
                alt="email"
                width={24}
                height={24}
                className="align-middle"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg text-gray-900">
              To: <span className="text-green-600 font-bold">Enablment</span>
            </h2>
            <button
              className="flex-none w-12 h-12 bg-black text-xl text-white rounded-full hover:bg-red-500 hover:scale-105 transition transform duration-200 ease-in-out"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="flex-grow">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full mb-4 p-2 border border-gray-500 rounded"
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                className="w-full mb-4 p-2 border border-gray-500 rounded"
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your message"
                className="w-full mb-4 p-2 border border-gray-500 rounded"
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              <div className="text-xs text-gray-500 flex-grow">
                This site is protected by reCAPTCHA and the Google
                <a href="#" className="text-blue-700 hover:underline">
                  {" "}
                  Privacy Policy
                </a>{" "}
                and
                <a href="#" className="text-blue-700 hover:underline">
                  {" "}
                  Terms of Service
                </a>{" "}
                apply.
              </div>
              <button
                type="submit"
                className="flex-none flex items-center justify-center w-12 h-12 bg-black text-white p-2 rounded-full hover:bg-green-500 hover:scale-105 transition transform duration-200 ease-in-out"
                aria-label="Send"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // If not used as an overlay, just return the form content
  if (!isOverlay) {
    return formContent;
  }

  // Use as a modal overlay with animation
  return (
    <motion.div
      className={`fixed inset-0 flex justify-center items-center z-40 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="z-50">{formContent}</div>
    </motion.div>
  );
};

export default ContactForm;
