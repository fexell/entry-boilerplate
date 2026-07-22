import { Suspense } from "react"
import { notFound } from "next/navigation"

import ProjectContent from "./ProjectContent"

import SuspenseFallback from "@/components/UI/SuspenseFallback"

import api from '@/lib/api'

export async function generateMetadata({ params }) {
  const { user, slug } = await params

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${user}/${slug}`,
      { cache: "no-store" }
    )
    if (!res.ok) return {}
    const project = await res.json()
    return { title: `${project.ownerUsername}/${project.name} – Audwio` }
  } catch {
    return {}
  }
}

export default function ProjectPage() {
  return (
    <>
      <Suspense fallback={<SuspenseFallback />}>
        <ProjectContent />
      </Suspense>
    </>
  )
}
