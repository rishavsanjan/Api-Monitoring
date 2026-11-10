
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">

        <div className="text-sm font-medium tracking-[0.3em] text-blue-400 mb-6">
          API MONITORING
        </div>

        <h1 className="text-8xl md:text-9xl font-bold tracking-tight text-white">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mt-6">
          Page not found
        </h2>

        <p className="text-zinc-400 mt-4 leading-relaxed">
          The page you're looking for doesn't exist,
          has been moved, or is temporarily unavailable.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-zinc-600 mt-12">
          Error Code: 404
        </p>

      </div>
    </main>
  );
}
