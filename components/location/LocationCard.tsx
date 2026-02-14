interface LocationCardProps {
  name: string
  address: string
  hours: string
  image: string
  directionsUrl: string
  orderUrl: string
}

export default function LocationCard({
  name,
  address,
  hours,
  image,
  directionsUrl,
  orderUrl,
}: LocationCardProps) {
  return (
    <section className="relative w-full h-[500px] overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-6xl mx-auto px-6 text-white">

          <h2 className="text-4xl font-bold">{name}</h2>

          <p className="mt-3 text-lg">{address}</p>
          <p className="text-lg">{hours}</p>

          <div className="mt-6 flex gap-4">
            <a
              href={directionsUrl}
              target="_blank"
              className="rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition"
            >
              Get Directions
            </a>

            <a
              href={orderUrl}
              className="rounded-full bg-yellow-400 text-black px-6 py-3 font-semibold hover:bg-yellow-500 transition"
            >
              Order Now
            </a>
          </div>

        </div>
      </div>

    </section>
  )
}
