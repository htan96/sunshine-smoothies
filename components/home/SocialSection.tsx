"use client";

import { FaInstagram, FaTiktok, FaYelp } from "react-icons/fa";

export default function SocialSection() {
  return (
    <section className="relative bg-black text-white py-28">
      
      {/* Top subtle divider */}
      <div className="absolute top-0 left-0 w-full h-px bg-white/10" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Stay Connected With Us
        </h2>

        {/* Subtext */}
        <p className="text-white/70 mb-16 text-lg">
          Follow us for new flavors, community events, and special promotions.
        </p>

        {/* Social Icons */}
        <div className="flex justify-center gap-16 flex-wrap">

          {/* Instagram */}
          <a
            href="#"
            target="_blank"
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full border border-white/20 text-3xl transition duration-300 group-hover:bg-yellow-400 group-hover:text-black">
              <FaInstagram />
            </div>
            <span className="text-sm tracking-wide text-white/60 group-hover:text-white transition">
              Instagram
            </span>
          </a>

          {/* TikTok */}
          <a
            href="#"
            target="_blank"
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full border border-white/20 text-3xl transition duration-300 group-hover:bg-yellow-400 group-hover:text-black">
              <FaTiktok />
            </div>
            <span className="text-sm tracking-wide text-white/60 group-hover:text-white transition">
              TikTok
            </span>
          </a>

          {/* Yelp */}
          <a
            href="#"
            target="_blank"
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full border border-white/20 text-3xl transition duration-300 group-hover:bg-yellow-400 group-hover:text-black">
              <FaYelp />
            </div>
            <span className="text-sm tracking-wide text-white/60 group-hover:text-white transition">
              Yelp
            </span>
          </a>

        </div>
      </div>
    </section>
  );
}
