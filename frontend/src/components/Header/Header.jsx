"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowRight, UserPlus, User, Settings, LogOut, Menu, Plus, Mail, Package } from "lucide-react"
import { toast } from "sonner"
import clsx from "clsx"

import LogoutButtonComponent from "../Utils/LogoutButton"
import SettingsButtonComponent from "../Utils/SettingsButton"
import Logo from "../Utils/Logo"
import LoginButton from "../Utils/LoginButton"
import Dropdown from '../UI/Dropdown'
import Breadcrumbs from '../UI/Breadcrumbs'

import useAuthStore from "@/store/useAuthStore"
import useMenuStore from "@/store/useMenuStore"
import { useSubNav } from "@/context/SubNavContext"

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
  const user = useAuthStore((u) => u.user)
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut)
  const { open } = useMenuStore()
  const { subNav } = useSubNav()

  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/auth/logged-out?from=logout")
    toast.success("Logged out.")
  }

  return (
    <>
      <header
        id="MainHeader"
        className={clsx(
          "flex flex-col sticky w-full top-0 z-40 border-b border-neutral-800/60 bg-neutral-950 backdrop-blur-md",
          subNav ? "pt-2" : "py-2"
        )}
      >
        <div className="header-top w-full mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex flex-row">
            <button
              className="px-2 mr-4 border rounded-lg border-neutral-800 hover:bg-neutral-800"
              onClick={() => open()}>
              <Menu className="w-5 h-5 text-white" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <Logo linkClassName="flex items-center gap-2" width={40} height={40} />
            </Link>
            <Breadcrumbs />
          </div>

          {/* Right-hand actions */}
          <div className="flex flex-row justify-center items-center">
            <div className="flex flex-row mr-2">
              <Link href="/new" className="block p-2 border rounded-lg border-neutral-800 hover:bg-neutral-800">
                <Plus className="w-5 h-5 text-white" />
              </Link>
              <Link href={`/${user?.username}/projects`} className="block p-2 ml-2 border rounded-lg border-neutral-800 hover:bg-neutral-800">
                <Package className="w-5 h-5 text-white" />
              </Link>
              <Link href="/messages" className="block p-2 ml-2 border rounded-lg border-neutral-800 hover:bg-neutral-800">
                <Mail className="w-5 h-5 text-white" />
              </Link>
            </div>
            <div>
              <Dropdown align="right">
                <Dropdown.Trigger className="p-2 border border-neutral-800 rounded-full hover:bg-neutral-800">
                  <User className="w-5 h-5 text-white" />
                </Dropdown.Trigger>

                <Dropdown.Menu>
                  <Dropdown.Item href={`/${user?.username}`} icon={<User />}>Profile</Dropdown.Item>
                  <Dropdown.Item href="/settings" icon={<Settings />}>Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} icon={<LogOut />} danger>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Sub-nav slot — rendered when a page injects content via SubNavContext */}
        {subNav && (
          <div className="header-bottom border-t border-neutral-800/60">
            {subNav}
          </div>
        )}
      </header>
    </>
  )
}

export default function HeaderComponent() {
  const { isAuthenticated, isInitialized } = useAuthStore()

  return (
    <>
      {isInitialized && isAuthenticated ? <LoggedInHeader /> : <LoggedOutHeader />}
    </>
  )
}
