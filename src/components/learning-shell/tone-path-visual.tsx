export function TonePathVisual() {
  return (
    <svg
      aria-labelledby="tone-path-title tone-path-description"
      className="h-auto w-full"
      role="img"
      viewBox="0 0 720 170"
    >
      <title id="tone-path-title">The four Mandarin tone shapes</title>
      <desc id="tone-path-description">
        A learning path moves through level, rising, dipping, and falling tone
        shapes.
      </desc>

      <path
        className="stroke-focus/40"
        d="M72 100C136 100 150 57 222 57S305 118 376 118 466 44 538 44s76 54 106 54"
        fill="none"
        strokeLinecap="round"
        strokeWidth="2"
      />

      <g className="fill-background stroke-focus" strokeWidth="3">
        <circle cx="72" cy="100" r="19" />
        <circle cx="238" cy="61" r="19" />
        <circle cx="392" cy="114" r="19" />
        <circle cx="644" cy="98" r="19" />
      </g>

      <g className="fill-focus text-[13px] font-semibold">
        <text textAnchor="middle" x="72" y="105">1</text>
        <text textAnchor="middle" x="238" y="66">2</text>
        <text textAnchor="middle" x="392" y="119">3</text>
        <text textAnchor="middle" x="644" y="103">4</text>
      </g>

      <g className="fill-muted-foreground text-[12px] font-medium">
        <text textAnchor="middle" x="72" y="145">mā</text>
        <text textAnchor="middle" x="238" y="29">má</text>
        <text textAnchor="middle" x="392" y="154">mǎ</text>
        <text textAnchor="middle" x="644" y="142">mà</text>
      </g>
    </svg>
  )
}
