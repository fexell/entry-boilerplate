import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import clsx from "clsx"

export default function LoginButton({ children, className }) {
  const pathname = usePathname()

  return (
    <>
      <Link
        href={`/auth/login?fp=${pathname !== "/" ? encodeURIComponent(pathname) : "index"}`} // fp = "from page/path"
        className={clsx(
          className,
          "flex text-sm text-neutral-400 hover:text-(--primary-color) transition-colors font-mono"
        )}
      >
        {children ?? "LOGIN"}
      </Link>
    </>
  )
}
