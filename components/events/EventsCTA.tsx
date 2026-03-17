import Link from "next/link";

export default function EventsCTA() {
  return (
    <section className="py-24 bg-black text-white text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-semibold tracking-tight">
          Join Us Next Time
        </h2>

        <p className="mt-4 text-gray-300 text-lg">
          Follow us on social media to stay updated on Free Smoothie Day
          and other community events.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/menu"
            className="inline-block rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black hover:bg-yellow-500 transition"
          >
            View Our Menu
          </Link>
          <Link
            href="/community"
            className="inline-block rounded-full border border-white px-8 py-3 font-semibold text-white hover:bg-white hover:text-black transition"
          >
            Explore Community Impact
          </Link>
        </div>
      </div>
    </section>
  );
}
