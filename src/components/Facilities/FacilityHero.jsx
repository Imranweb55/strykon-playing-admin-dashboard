import { Waves, ArrowRight } from "lucide-react";

// Background image path - place your image at:
// public/assets/swimming-pool/swimming-hero.jpg
const HERO_BG_PATH = "/assets/swimming-pool/swimming-hero.jpg";

const FacilityHero = () => {
  return (
    <div
      className="relative min-h-[230px] overflow-hidden rounded-2xl bg-cover bg-center sm:min-h-[260px]"
      style={{ backgroundImage: `url(${HERO_BG_PATH})` }}
    >
      {/* Light overall tint so white text/button stay legible everywhere on the image */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative flex h-full items-center px-6 py-8 sm:px-10">
        {/* Frosted glass panel behind the text only - image stays fully visible around it */}
        <div className="max-w-md rounded-2xl bg-blue-950/35 p-6 shadow-lg backdrop-blur-md sm:p-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[2px] text-cyan-300">
            <Waves size={14} />
            SWIMMING POOL
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Swimming Pool
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-200 sm:text-base">
            Track bookings, manage head count and handle payments for your
            swimming pool.
          </p>
        </div>
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
