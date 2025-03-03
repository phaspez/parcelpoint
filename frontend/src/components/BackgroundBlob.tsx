export default function BackgroundBlob() {
  const generateRandomBlob = () => {
    const points = new Array(10).fill(0).map(() => {
      const x = Math.random() * 1000;
      const y = Math.random() * 1000;
      return `${x},${y}`;
    });
    return `M${points.join(" L")} Z`;
  };
  const blobPath = generateRandomBlob();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#9CAE89" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <filter id="blurFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>

          <filter id="grainy">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.95"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          <mask id="blobMask">
            <path d={blobPath} />
          </mask>
        </defs>

        <path
          fill="url(#blobGradient)"
          filter="url(#blurFilter)"
          d={blobPath}
        />

        <rect
          width="1000"
          height="1000"
          filter="url(#grainy)"
          mask="url(#blobMask)"
        />
      </svg>
    </div>
  );
}
