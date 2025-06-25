import ApolloWrapper from "../app/ApolloWrapper";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Roboto_Condensed,
  PT_Sans,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enablment",
  description: "Project Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
      ${geistSans.variable} 
      ${geistMono.variable} 
      ${robotoCondensed.variable} 
      ${ptSans.variable}
    `}
    >
      <body className="antialiased">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
