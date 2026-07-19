"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, UserPlus, User, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

import LogoutButtonComponent from "../Utils/LogoutButton"
import SettingsButtonComponent from "../Utils/SettingsButton"
import Logo from "../Utils/Logo"
import LoginButton from "../Utils/LoginButton"
import Dropdown from '../UI/Dropdown'

import useAuthStore from "@/store/useAuthStore"

export default function HeaderComponent() {
  const { isAuthenticated, isInitialized } = useAuthStore()

  return (
    <>
      {isInitialized && isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />}
    </>
  )
}

const LoggedOutHeader = () => {
  return (
    <>
      <header
        id="MainHeader"
        className="sticky py-2 top-0 z-40 border-b border-neutral-800/60 bg-neutral-950 backdrop-blur-md"
      >
        <div className="mx-auto flex items-center justify-between px-6 py-2">
          {/* Brand mark — same eyebrow language as the login screen */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <Logo linkClassName="flex items-center gap-2" width={40} height={40} />
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <LoginButton />
            <Link
              href="/auth/signup"
              className="flex items-center p-2 px-4 gap-2 rounded-full font-mono text-xs tracking-widest text-neutral-950 transition-colors bg-(--primary-color) hover:bg-(--primary-color-hover)"
            >
              <UserPlus className="w-4 h-4" />
              SIGN UP
            </Link>
          </div>
        </div>
      </header> 
    </>
  )
}

const LoggedInHeader = () => {
  const logout = useAuthStore((s) => s.logout)
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/auth/logged-out?from=logout")
    toast.success("Logged out.")
  }

  return (
    <>
      <header
        id="MainHeader"
        className="sticky py-2 top-0 z-40 border-b border-neutral-800/60 bg-neutral-950 backdrop-blur-md"
      >
        <div className="mx-auto flex items-center justify-between px-6 py-2">
          {/* Brand mark — same eyebrow language as the login screen */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <Logo linkClassName="flex items-center gap-2" width={40} height={40} />
          </Link>

          {/* Right-hand actions */}
          <Dropdown align="right">
            <Dropdown.Trigger className="p-1">
              <User className="w-6 h-6 text-white" />
            </Dropdown.Trigger>

            <Dropdown.Menu>
              <Dropdown.Item href="/settings" icon={<Settings />}>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} icon={<LogOut />} danger>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
    </>
  )
}
