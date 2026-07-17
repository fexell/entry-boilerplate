import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"

import HeaderComponent from "@/components/Header/Header";
import FooterComponent from "@/components/Footer/Footer";
import AuthProvider from '@/components/Auth/AuthProvider';
import CookieConsent from "@/components/UI/CookieConsent";
import Logo from "@/components/Utils/Logo";

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
  title: (process.env.NEXT_PUBLIC_APP_NAME ?? "ENTRY"),
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

          <div className="flex flex-col justify-center items-center h-[57px] border-t border-neutral-800 bg-neutral-950 px-4 py-4">
            <div className="w-full mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-neutral-400 sm:flex-row">
              <span>
                &copy; {new Date().getFullYear()}{" "}
                {process.env.NEXT_PUBLIC_APP_NAME ?? "Entry"}. All rights
                reserved.
              </span>
              <Link
                href="/info"
                className="text-neutral-500 transition-colors hover:text-(--primary-color)"
              >
                Terms, Privacy & Cookies
              </Link>
            </div>
          </div>

          <CookieConsent />
          <Toaster
            theme="dark"
            position="bottom-center"
            richColors={false}
            closeButton
            toastOptions={{
              unstyled: false,
              classNames: {
                toast:
                  "!bg-neutral-950 !border !border-neutral-800 !text-neutral-200 !font-sans !rounded-lg !shadow-xl !shadow-black/40 !gap-3",
                title: "!text-sm !font-medium !text-neutral-100",
                description: "!text-sm !text-neutral-500 !mt-0.5",
                actionButton:
                  "!bg-(--primary-color) !text-neutral-950 !text-xs !font-medium !rounded-md hover:!bg-(--primary-color-hover)",
                cancelButton:
                  "!bg-neutral-800 !text-neutral-400 !text-xs !rounded-md hover:!bg-neutral-700",
                closeButton:
                  "!bg-neutral-900 !border-neutral-800 !text-neutral-500 hover:!text-neutral-300",
                icon: "!text-neutral-500",
                success: "!border-green-800/50 [&_[data-icon]]:!text-green-400",
                error: "!border-red-800/50 [&_[data-icon]]:!text-red-400",
                warning: "!border-amber-800/50 [&_[data-icon]]:!text-amber-400",
                info: "!border-neutral-700 [&_[data-icon]]:!text-(--primary-color)",
              },
            }}
          />
        </body>
      </html>
    </>
  );
}

export default RootLayout;
