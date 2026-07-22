

import DashboardContent from './Dashboard'

export const metadata = {
  title: "Dashboard | " + process.env.NEXT_PUBLIC_APP_NAME
}

export default function DashboardPage() {
  return (
    <>
      <DashboardContent />
    </>
  )
}