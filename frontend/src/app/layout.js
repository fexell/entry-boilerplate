import { Geist, Geist_Mono } from "next/font/google";

import HeaderComponent from "@/components/Header/Header";
import FooterComponent from "@/components/Footer/Footer";
import AuthProvider from '@/components/Auth/AuthProvider';

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

const RootLayout = ({ children }) => {
  return (
    <>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </>
  );
}

export default RootLayout;
