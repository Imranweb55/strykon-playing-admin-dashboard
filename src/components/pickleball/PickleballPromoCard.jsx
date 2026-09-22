// Background image path - place your image at:
// public/assets/pickleball/pickleball-promo.jpg
const PROMO_BG_PATH = "/assets/pickleball/pickleball-promo.jpg";

const PickleballPromoCard = () => {
  return (
    <div
      className="relative flex min-h-[140px] flex-col justify-end overflow-hidden rounded-2xl bg-slate-900 bg-cover bg-center p-5"
      style={{ backgroundImage: `url(${PROMO_BG_PATH})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
      <div className="relative">
        <p className="text-lg font-extrabold leading-tight text-white">
          Play, Improve,
          <br />
          Be a Better You
        </p>
        <span className="mt-2 inline-block h-[3px] w-10 rounded bg-emerald-400" />
      </div>
    </div>
  );
};

export default PickleballPromoCard;
