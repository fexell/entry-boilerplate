import Image from "next/image"
import Link from "next/link"

const LogoSvg = ({ width, height, ...props }) => {
  return (
    <>
      <svg
        id="Audwio_Logo"
        data-name="Audwio Logo"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 2994.99 2794.87"
        width={width}
        height={height}
        {...props}
      >
        <defs>
          <style>
            {`
              .cls-1, .cls-2 {
                fill: #fff;
              }
              .cls-2 {
                isolation: isolate;
              }
              .cls-3 {
                fill: url(#linear-gradient);
              }
            `}
          </style>
          <linearGradient
            id="linear-gradient"
            x1="-986.02"
            y1="3878.35"
            x2="-980.99"
            y2="3873.32"
            gradientTransform="translate(552274.13 2171848.67) scale(560 -560)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#00d4ff" />
            <stop offset="1" stopColor="#07f" />
          </linearGradient>
        </defs>
        <rect
          className="cls-3"
          x="131.87"
          width="2758.46"
          height="2758.46"
          rx="605.06"
          ry="605.06"
        />
        <g>
          <path className="cls-1" d="M757.45,1428.49h0c46.25,0,83.74,37.49,83.74,83.74v423.62c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74v-423.62c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M1028.37,1132.94h0c46.25,0,83.74,37.49,83.74,83.74v719.17c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74v-719.17c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M1299.29,788.13h0c46.25,0,83.74,37.49,83.74,83.74v1063.98c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74V871.87c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M1570.21,541.84h0c46.25,0,83.74,37.49,83.74,83.74v1310.27c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74V625.58c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M1841.13,788.13h0c46.25,0,83.74,37.49,83.74,83.74v1063.98c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74V871.87c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M2112.05,1132.94h0c46.25,0,83.74,37.49,83.74,83.74v719.17c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74v-719.17c0-46.25,37.49-83.74,83.74-83.74Z" />
          <path className="cls-1" d="M2382.97,1428.49h0c46.25,0,83.74,37.49,83.74,83.74v423.62c0,46.25-37.49,83.74-83.74,83.74h0c-46.25,0-83.74-37.49-83.74-83.74v-423.62c0-46.25,37.49-83.74,83.74-83.74Z" />
        </g>
        <path
          className="cls-2"
          d="M1018.52,1576.26h1374.3c40.81,0,73.89,33.08,73.89,73.89h0c0,40.81-33.08,73.89-73.89,73.89H1018.52c-40.81,0-73.89-33.08-73.89-73.89h0c0-40.81,33.08-73.89,73.89-73.89Z"
        />
      </svg>
    </>
  )
}

export default function Logo({ link, linkClassName, width, height }){
  return (
    <>
      <div>
        { link ? (
          <Link href={link} className={linkClassName}>
            <LogoSvg width={width} height={height} />
          </Link>
        ) : (
          <LogoSvg width={width} height={height} />
        )}
      </div>
    </>
  )
}
