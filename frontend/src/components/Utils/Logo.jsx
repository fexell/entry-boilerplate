import Image from "next/image"
import Link from "next/link"

export default function Logo({ link, linkClassName, width, height }){
  return (
    <>
      <div>
        { link ? (
          <Link href={link} className={linkClassName}>
            <Image
              src="/entry-logo-icon.svg"
              alt="Entry Logo"
              width={width}
              height={height}
            />
          </Link>
        ) : (
          <Image
            src="/entry-logo-icon.svg"
            alt="Entry Logo"
            width={width}
            height={height}
          />
        )}
      </div>
    </>
  )
}
