import Link from "next/link"
import { Folder, Globe, Lock, Clock, ImageIcon } from "lucide-react"

/**
 * Shared project card component.
 *
 * Props:
 *   project       — ProjectResponse object
 *   showPrivacy   — show the public/private icon (default: true)
 *   showUpdatedAt — show "Updated …" instead of "Created …" (default: false)
 *   descriptionLines — number of lines to clamp description (default: 2)
 */
export default function ProjectCard({
  project,
  showPrivacy = true,
  showUpdatedAt = false,
  descriptionLines = 2,
}) {
  const isPrivate = project.visibility === "private"
  const date = showUpdatedAt
    ? (project.updatedAt ?? project.createdAt)
    : project.createdAt

  return (
    <Link
      href={`/${project.ownerUsername}/${project.slug}`}
      className="group flex flex-row gap-3 border border-neutral-800 hover:border-neutral-700 rounded-lg px-4 py-4 transition-colors"
    >
      {/* Cover image — fixed 72×72 square */}
      <div className="shrink-0 w-[72px] h-[72px] rounded-md overflow-hidden bg-neutral-800 border border-neutral-700/50 flex items-center justify-center">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-5 h-5 text-neutral-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1 gap-1">
        {/* Top row: name + badges */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Folder className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <span className="text-sm font-medium text-neutral-200 group-hover:text-white truncate transition-colors">
              {project.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {project.genre && (
              <span className="text-[11px] text-neutral-500 bg-neutral-800/60 rounded px-2 py-0.5">
                {project.genre}
              </span>
            )}
            {showPrivacy && (
              <span className="text-neutral-600" title={isPrivate ? "Private" : "Public"}>
                {isPrivate
                  ? <Lock className="w-3.5 h-3.5" />
                  : <Globe className="w-3.5 h-3.5" />
                }
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p
            className="text-xs text-neutral-500 leading-relaxed"
            style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: descriptionLines, overflow: "hidden" }}
          >
            {project.description}
          </p>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 mt-auto">
          {showUpdatedAt && <Clock className="w-3 h-3 text-neutral-700" />}
          <p className="text-[11px] text-neutral-600">
            {showUpdatedAt ? "Updated " : ""}
            {new Date(date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  )
}
