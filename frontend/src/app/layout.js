import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"

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

          <Toaster
            theme="dark"
            position="bottom-center"
            richColors={false}
            toastOptions={{
              unstyled: false,
              className: {
                toast: "bg-neutral-950 border border-neutral-800 text-neutral-200 font-sans shadow-lg",
                title: "text-sm text-neutral-200",
                description: "text-sm text-neutral-400",
                actionButton: "bg-(--primary-color) text-neutral-950",
                cancelButton: "bg-neutral-800 text-neutral-300",
              },
              classNames: {
                success: "!border-green-800/60 !text-green-200/90",
                error: "!border-red-800/60 !text-red-200/90",
              }
            }}
          />
        </body>
      </html>
    </>
  );
}

export default RootLayout;
