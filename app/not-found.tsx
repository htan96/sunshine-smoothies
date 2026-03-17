import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-neutral-50">
      <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-charcoal)]">
        Page not found
      </h1>
      <p className="text-[var(--color-muted)] text-center max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[var(--color-orange)] px-8 py-3 font-semibold text-black hover:opacity-90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}