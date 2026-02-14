export default function Hero() {
  return (
    <section className="relative h-screen w-full">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Fresh smoothies.
            <br />
            Real ingredients.
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            Made fresh daily for the community.
          </p>

          <div className="mt-8 flex justify-center gap-6 flex-wrap">

  <a
    href="/contact"
    className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black hover:bg-yellow-500 transition"
  >
    View Locations
  </a>

  <a
    href="/menu"
    className="rounded-full border border-white px-8 py-3 font-semibold text-white hover:bg-white hover:text-black transition"
  >
    Explore Menu
  </a>

</div>

        </div>
      </div>
    </section>
  );
}
