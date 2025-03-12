import ApolloWrapper from "../app/ApolloWrapper";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Roboto_Condensed,
  PT_Sans,
  Rubik,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
  variable: "--font-roboto-condensed",
});

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt-sans",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
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
      ${rubik.variable}
    `}
    >
      <body className="antialiased">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
