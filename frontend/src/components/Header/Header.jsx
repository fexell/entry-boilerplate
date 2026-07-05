"use client"

import Link from "next/link"

import LogoutButtonComponent from "../Utils/LogoutButton";
import SettingsButtonComponent from "../Utils/SettingsButton";

import useAuthStore from "@/store/useAuthStore"

const HeaderComponent = () => {
  const { isAuthenticated, isInitialized } = useAuthStore()

  return (
    <>
      <header id="MainHeader" className="">
        <div>
          {(!isAuthenticated && isInitialized) && (
            <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Log in
            </Link>
          )}
          {isAuthenticated && isInitialized && <LogoutButtonComponent />}
          {isAuthenticated && isInitialized && <SettingsButtonComponent />}
        </div>
      </header>
    </>
  )
}

export default HeaderComponent;
