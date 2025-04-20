interface Props {
  className?: string
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <svg
      width="170"
      height="40"
      viewBox="0 0 300 60"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
    >
      <text x="0" y="40" fontFamily="monospace" fontSize="32" fill="currentColor">
        The
      </text>
      <text x="90" y="40" fontFamily="monospace" fontSize="32" fill="currentColor">
        Novine
      </text>
      <path
        d="M240 20 L250 10 L260 20 M250 10 V50 M240 40 L250 50 L260 40"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
