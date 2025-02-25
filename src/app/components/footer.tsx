// FooterComponent.tsx
import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <div className="flex justify-between px-4 bg-gray-100 text-sm text-gray-600 mb-2">
      <div className="mt-4 w-1/2">
        <p>Øster Allé 56 6. sal</p>
        <p>2100 København Ø</p>
        <p>CVR: 42309648</p>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4">
          <a href="#" className="text-blue-600 hover:underline">
            Cookie policy
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="text-blue-600 hover:underline">
            Privacy policy
          </a>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 ">
        <div className="flex mt-2">
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
          <span className="text-black">(+45) 22 92 67 80</span>
          <Image src="/icons/phone.svg" alt="Call" width={24} height={24} />
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-black mb-1">gd@enablment.com</span>
          <Image src="/icons/mail.svg" alt="Email" width={24} height={24} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
