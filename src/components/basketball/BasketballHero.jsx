import { Dribbble, ArrowRight } from "lucide-react";

// Background image path - place your image at:
// public/assets/basketball/basketball-hero.jpg
const HERO_BG_PATH = "/assets/basketball/basketball-hero.png";

const BasketballHero = () => {
  return (
    <div
      className="relative min-h-[230px] overflow-hidden rounded-2xl bg-cover bg-center sm:min-h-[260px]"
      style={{ backgroundImage: `url(${HERO_BG_PATH})` }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative flex h-full items-center px-6 py-8 sm:px-10">
        <div className="max-w-md rounded-2xl bg-blue-950/35 p-6 shadow-lg backdrop-blur-md sm:p-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[2px] text-orange-300">
            <Dribbble size={14} />
            BASKETBALL
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Basketball Court
          </h1>
          <p className="mt-2 max-w-xs text-sm text-slate-200 sm:text-base">
            Book your slot, manage players, and enjoy the game.
          </p>
        </div>
      </div>

      <button className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 sm:right-10">
        <Dribbble size={16} />
        View Court Details
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default BasketballHero;
