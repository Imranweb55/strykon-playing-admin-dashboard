import { useAuth } from "../../context/AuthContext";

// Background image path - place your generated image at:
// public/assets/dashboard/dashboard.jpg
const HERO_BG_PATH = "/assets/dashboard/dashboard.jpg";

const HeroBanner = () => {
  const { admin } = useAuth();

  return (
    <div
      className="relative flex min-h-[220px] items-center overflow-hidden rounded-2xl bg-slate-800 bg-cover bg-center sm:min-h-[240px]"
      style={{ backgroundImage: `url(${HERO_BG_PATH})` }}
    >
      {/* Dark gradient so the white text stays readable over the image */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-slate-900/80" />

      <div className="relative ml-auto max-w-sm px-6 py-8 text-left sm:px-10">
        <p className="text-lg font-medium text-white sm:text-xl">
          Welcome <span className="font-extrabold">Back,</span>
        </p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {admin?.name || "Admin"}
        </h1>
        <p className="mt-2 text-sm text-slate-200 sm:text-base">
          Manage bookings, members, sessions and grow your academy.
        </p>
        <span className="mt-3 inline-block h-[3px] w-12 rounded bg-gradient-to-r from-amber-300 to-orange-500" />
      </div>
    </div>
  );
};

export default HeroBanner;
