function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center">
        {/* Spinning gradient ring */}
        <div
          className="h-16 w-16 animate-spin rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, var(--grad-start) 50%, var(--grad-end) 100%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          }}
        />

        {/* Center logo badge */}
        <div
          className="absolute flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
            boxShadow: "0 0 20px var(--accent-glow)",
          }}
        >
          P
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Loading…
        </p>
      </div>
    </div>
  );
}

export default PageLoader;