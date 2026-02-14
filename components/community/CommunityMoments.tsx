export default function CommunityMoments() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
            Community In Action
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            From school visits to youth sponsorships, we believe in investing
            in people — not just products.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">

          {/* Block 1 */}
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-4">
              Supporting Local Schools
            </h3>

            <p className="text-gray-600 leading-relaxed">
              We regularly partner with schools to encourage healthy habits,
              reward students, and support educational programs.
            </p>
          </div>

          {/* Block 2 */}
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-4">
              Youth & Athletics
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Proud sponsors of youth sports teams and athletic programs,
              helping fuel the next generation on and off the field.
            </p>
          </div>

          {/* Block 3 */}
          <div>
            <h3 className="text-xl font-semibold text-[#0f172a] mb-4">
              Community Events
            </h3>

            <p className="text-gray-600 leading-relaxed">
              From local fundraisers to neighborhood initiatives, we show up
              for the people who support us every day.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
