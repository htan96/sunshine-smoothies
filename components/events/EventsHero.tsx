import Image from "next/image";

export default function EventsHero() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            A Day to Give Back
          </h2>
          <div className="h-[3px] w-14 bg-yellow-400 mt-4 mb-6" />
          <p className="text-gray-700 leading-relaxed text-lg">
            Every year, we celebrate our community with complimentary smoothies —
            no strings attached. It&apos;s our way of thanking Vallejo for supporting
            us from day one.
          </p>
        </div>

        {/* Two photos side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/events/newspaper.jpeg"
              alt="Newspaper coverage of Free Smoothie Day"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/events/larussels.jpeg"
              alt="Community celebration at Sunshine Smoothies"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
