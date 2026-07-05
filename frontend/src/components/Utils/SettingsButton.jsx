import Link from "next/link"
import { Settings } from "lucide-react"

const SettingsButtonComponent = () => {
  return (
    <>
      <Link
        href="/settings"
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Settings
      </Link>
    </>
  );
}

export default SettingsButtonComponent
