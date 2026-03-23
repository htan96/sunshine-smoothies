const EVENTS = [
  {
    date: "April 15",
    year: "2026",
    name: "Summer Kick Off",
    tagline: "Free Smoothie Day — complimentary smoothies for our Vallejo community.",
    featured: true,
  },
  {
    date: "July 7",
    year: "2026",
    name: "7/7 Lucky 7s",
    tagline: "7th day of the 7th month.",
    featured: false,
  },
  {
    date: "August",
    year: "2026",
    name: "11 Year Anniversary",
    tagline: "Celebrating a decade-plus of Vallejo love.",
    featured: false,
  },
  {
    date: "December",
    year: "2026",
    name: "Christmas Giveaway",
    tagline: "Holiday surprises for our community.",
    featured: false,
  },
];

export default function EventsSchedule() {
  return (
    <section className="py-20 bg-neutral-50 border-t border-gray-100">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Upcoming Events
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Mark your calendar — we&apos;ll see you there.
        </p>

        <div className="space-y-4">
          {EVENTS.map((event) => (
            <div
              key={event.name}
              className={`rounded-2xl border p-6 md:p-8 transition-all ${
                event.featured
                  ? "border-[var(--color-orange)]/40 bg-white shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {event.date}
                    </span>
                    <span className="text-sm text-gray-500">{event.year}</span>
                    {event.featured && (
                      <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-orange)]/20 text-[var(--color-orange-dark)]">
                        Next up
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-semibold text-gray-900 text-lg">
                    {event.name}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {event.tagline}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
