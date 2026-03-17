import Image from "next/image";

const GALLERY_IMAGES = [
  { src: "/events/newspaper.jpeg", alt: "Newspaper coverage of Free Smoothie Day" },
  { src: "/events/larussels.jpeg", alt: "Community celebration at Sunshine Smoothies" },
];

export default function EventsGallery() {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Photos from the Day
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Moments from our annual Free Smoothie Day celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((image) => (
            <div
              key={image.src}
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-200"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
