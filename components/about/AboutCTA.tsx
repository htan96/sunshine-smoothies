export default function AboutCTA() {
  return (
    <section className="py-24 bg-black text-white text-center">
      <div className="max-w-4xl mx-auto px-6">

        <h2 className="text-4xl font-semibold tracking-tight">
          More Than Smoothies
        </h2>

        <p className="mt-4 text-gray-300 text-lg">
          Giving back and supporting local initiatives is at the heart of what we do.
        </p>

        <a
          href="/community"
          className="inline-block mt-8 rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black hover:bg-yellow-500 transition"
        >
          Explore Our Community Impact
        </a>

      </div>
    </section>
  );
}
