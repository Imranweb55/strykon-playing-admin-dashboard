import { Waves, ArrowRight } from "lucide-react";

// Background image path - place your image at:
// public/assets/swimming-pool/swimming-hero.jpg
const HERO_BG_PATH = "/assets/swimming-pool/swimming-hero.jpg";

const FacilityHero = () => {
  return (
    <div className="relative min-h-[230px] overflow-hidden rounded-2xl bg-[#0b2340] sm:min-h-[260px]">
      {/* Diagonally clipped background image */}
      <div
        className="absolute inset-y-0 right-0 w-[65%] bg-cover bg-center sm:w-[60%]"
        style={{
          backgroundImage: `url(${HERO_BG_PATH})`,
          clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Dark gradient so the text stays readable, blending into the image */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b2340] via-[#0b2340]/95 to-transparent" />

      <div className="relative flex h-full max-w-md flex-col justify-center gap-3 px-6 py-8 sm:px-10">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[2px] text-cyan-300">
          <Waves size={14} />
          SWIMMING POOL
        </span>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Swimming Pool
        </h1>
        <p className="max-w-xs text-sm text-slate-300 sm:text-base">
          Track bookings, manage head count and handle payments for your
          swimming pool.
        </p>
      </div>

      <button className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-[#123a63] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#164b7f] sm:right-10">
        <Waves size={16} />
        View Pool Details
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default FacilityHero;
