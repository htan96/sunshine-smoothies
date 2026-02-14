export default function CommunitySupport() {
  return (
    <section className="bg-black py-24">
  <div className="max-w-4xl mx-auto text-center px-6">

    <div className="w-12 h-1 bg-yellow-400 mx-auto mb-6" />

    <h2 className="text-4xl font-bold text-white mb-6">
      Want To Help Us Do More?
    </h2>

    <p className="text-gray-300 text-lg mb-10 leading-relaxed">
      Every purchase already helps us give back to our community.
      If you'd like to go a step further, you can support the youth programs
      and initiatives we proudly partner with.
    </p>

    <div className="flex justify-center gap-6 flex-wrap">
      <a
        href="#"
        className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
      >
        Make A Donation
      </a>

      <a
        href="#"
        className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
      >
        Partner With Us
      </a>
    </div>

  </div>
</section>

  );
}
