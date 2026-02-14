export default function CommunityHero() {
  return (
    <section className="py-24 bg-white text-center">
      <div className="max-w-4xl mx-auto px-6">

        {/* Accent Line */}
        <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6 rounded-full" />

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 leading-tight">
          More Than Smoothies.
          <br />
          A Part Of The Community.
        </h1>

        {/* Subtext */}
        <p className="text-lg text-gray-600 leading-relaxed">
          Sunshine Smoothies has always been about more than what’s in the cup.
          We’re proud to support local schools, youth programs, and the people
          who make our communities stronger every day.
        </p>

      </div>
    </section>
  );
}
