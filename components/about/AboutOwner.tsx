import Image from "next/image"

export default function AboutOwner() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* Image */}
        <div className="relative w-full h-[420px] md:h-[500px] shadow-xl">
          <Image
            src="/owner.jpeg"
            alt="Carlos - Owner of Sunshine Smoothies"
            fill
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Meet Carlos
          </h2>

          <div className="h-[3px] w-14 bg-yellow-400 mt-4 mb-6" />

          <p className="text-gray-700 leading-relaxed text-lg">
            Sunshine Smoothies is built on more than ingredients — it's built on community.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed text-lg">
            Carlos has always believed that if you show up for your people,
            your people will show up for you. From supporting youth boxing programs
            to sponsoring local schools and athletics, his mission has never been
            just about business — it’s about impact.
          </p>

          <blockquote className="mt-8 border-l-4 border-yellow-400 pl-6 italic text-gray-600">
            “Carlos has been a pillar in the community and has always been in our corner.”
          </blockquote>

        </div>
      </div>
    </section>
  )
}
