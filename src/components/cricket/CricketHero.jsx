import { Zap, ArrowRight } from "lucide-react";

// Background image path - place your image at:
// public/assets/cricket/cricket-hero.jpg
const HERO_BG_PATH = "/assets/cricket/cricket-hero.png";

const CricketHero = () => {
  return (
    <div
      className="relative min-h-[230px] overflow-hidden rounded-2xl bg-cover bg-center sm:min-h-[260px]"
      style={{ backgroundImage: `url(${HERO_BG_PATH})` }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative flex h-full items-center px-6 py-8 sm:px-10">
        <div className="max-w-md rounded-2xl bg-emerald-950/35 p-6 shadow-lg backdrop-blur-md sm:p-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[2px] text-emerald-300">
            <Zap size={14} />
            CRICKET
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Cricket Court
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-200 sm:text-base">
            Book your slot, manage players, and enjoy the game.
          </p>
        </div>
      </div>

      {/* Decorative handwritten-style tagline */}
      <div className="absolute right-6 top-6 hidden text-right text-white sm:right-12 sm:top-8 md:block">
        <p
          className="text-xl italic leading-tight"
          style={{ fontFamily: "cursive" }}
        >
          Play
        </p>
        <p
          className="text-xl italic leading-tight"
          style={{ fontFamily: "cursive" }}
        >
          Like a
        </p>
        <p
          className="text-2xl italic leading-tight"
          style={{ fontFamily: "cursive" }}
        >
          Champion
        </p>
        <svg
          width="90"
          height="14"
          viewBox="0 0 90 14"
          className="ml-auto mt-1 opacity-80"
        >
          <path
            d="M2 8 Q 25 2, 45 8 T 88 6"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <button className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 sm:right-10">
        <Zap size={16} />
        View Court Details
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default CricketHero;
