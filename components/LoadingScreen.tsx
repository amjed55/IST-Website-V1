export function LoadingScreen({
  label = 'Loading',
  rows = 3,
  dark = false,
}: {
  label?: string;
  rows?: number;
  dark?: boolean;
}) {
  return (
    <div
      className={`container-ist min-h-[55vh] py-16 ${dark ? 'text-white' : 'text-ist-green'}`}
      aria-busy="true"
      aria-live="polite"
    >
      <span className={`eyebrow ${dark ? 'text-ist-teal-light' : ''}`}>{label}</span>
      <div
        className={`mt-5 h-12 max-w-xl rounded-2xl shimmer ${
          dark ? 'bg-white/10' : 'bg-ist-green/10'
        }`}
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className={`h-52 rounded-3xl shimmer ${
              dark ? 'bg-white/10' : 'bg-ist-green/10'
            }`}
          />
        ))}
      </div>
      <span className="sr-only">Content is loading.</span>
    </div>
  );
}
