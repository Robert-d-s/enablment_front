// FooterComponent.tsx
import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <div className="bg-gray-100 text-sm text-gray-600 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main content - centered layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Contact Information */}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">Contact</h4>
            <p>Øster Allé 56 6. sal</p>
            <p>2100 København Ø</p>
            <p>CVR: 42309648</p>
          </div>

          {/* Communication */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex gap-1 items-center">
                <span className="text-black">(+45) 22 92 67 80</span>
                <Image
                  src="/icons/phone.svg"
                  alt="Call"
                  width={20}
                  height={20}
                />
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-black">gd@enablment.com</span>
                <Image
                  src="/icons/mail.svg"
                  alt="Email"
                  width={20}
                  height={20}
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <Image
                src="/icons/instagram.svg"
                alt="instagram"
                width={24}
                height={24}
                className="hover:opacity-70 cursor-pointer"
              />
              <Image
                src="/icons/facebook.svg"
                alt="facebook"
                width={24}
                height={24}
                className="hover:opacity-70 cursor-pointer"
              />
              <Image
                src="/icons/linkedin.svg"
                alt="linkedin"
                width={24}
                height={24}
                className="hover:opacity-70 cursor-pointer"
              />
              <Image
                src="/icons/twitter.svg"
                alt="twitter"
                width={24}
                height={24}
                className="hover:opacity-70 cursor-pointer"
              />
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex-1 flex flex-col items-end">
            <h4 className="font-semibold text-gray-800 mb-2">Legal</h4>
            <div className="flex flex-col space-y-1 text-right">
              <a href="#" className="text-blue-600 hover:underline">
                Cookie policy
              </a>
              <a href="#" className="text-blue-600 hover:underline">
                Privacy policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
