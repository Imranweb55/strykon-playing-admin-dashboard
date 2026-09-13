import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import bgImage from "../../assets/login-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email/username and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="relative w-full min-h-screen bg-gradient-to-r from-black/15 via-black/10 to-black/35">
        {/* Top-left brand header */}
        <div className="absolute top-12 left-14 flex items-center gap-3.5">
          <span className="w-1 h-8 rounded-sm bg-gradient-to-b from-amber-300 to-orange-500" />
          <div>
            <h1 className="m-0 text-white text-2xl font-extrabold tracking-[6px]">
              STRYKON
            </h1>
            <p className="mt-0.5 text-gray-300 text-[11px] font-medium tracking-[4px]">
              SPORTS ACADEMY
            </p>
          </div>
        </div>

        {/* Bottom-left hero text */}
        <div className="absolute left-14 bottom-32 max-w-xl hidden md:block">
          <p className="m-0 mb-1.5 text-white text-[15px] font-bold tracking-[6px]">
            ADMIN CRM
          </p>
          <h2 className="m-0 text-white text-[68px] font-extrabold tracking-wide leading-none">
            DASHBOARD
          </h2>
          <p className="mt-5 text-gray-300 text-[13px] font-semibold tracking-[2px]">
            MANAGE MEMBERS &nbsp;/&nbsp; BOOKINGS &nbsp;/&nbsp; SESSIONS
            &nbsp;/&nbsp; MORE
          </p>
          <span className="block w-16 h-[3px] mt-3.5 rounded bg-gradient-to-r from-amber-300 to-orange-500" />
        </div>

        {/* Login card */}
        <div className="absolute top-1/2 right-4 md:right-24 -translate-y-1/2 md:translate-x-0 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 w-[420px] max-w-[90vw] px-9 pt-10 pb-8 bg-[#0c1018]/82 border border-orange-400/35 rounded-[18px] shadow-[0_0_60px_rgba(255,140,30,0.18),0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md text-center">
          <div className="w-[84px] h-[84px] mx-auto mb-3.5 flex items-center justify-center">
            {/*
              Place your official logo file inside the "public" folder of this
              project (e.g. public/logo.png) and it will show up here automatically.
            */}
            <img
              src="/logo.png"
              alt="Strykon Sports Academy Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h3 className="m-0 text-white text-[22px] font-extrabold tracking-[4px]">
            STRYKON
          </h3>
          <p className="mt-0.5 mb-6 text-gray-400 text-[10px] font-semibold tracking-[3px]">
            SPORTS ACADEMY
          </p>

          <h4 className="m-0 mb-1.5 text-white text-xl font-bold text-left">
            Admin Login
          </h4>
          <p className="m-0 mb-6 text-gray-400 text-[13px] text-left">
            Access your academy dashboard
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-[10px] px-3.5 focus-within:border-orange-500">
              <User size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="flex-1 bg-transparent border-none outline-none py-3.5 px-2.5 text-white text-sm placeholder:text-gray-500"
              />
            </div>

            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-[10px] px-3.5 focus-within:border-orange-500">
              <Lock size={18} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="flex-1 bg-transparent border-none outline-none py-3.5 px-2.5 text-white text-sm placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="bg-transparent border-none text-gray-400 cursor-pointer flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-orange-500"
                />
                Remember me
              </label>
              <a
                href="#forgot-password"
                className="text-orange-400 no-underline hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="m-0 text-red-400 text-[13px] text-left">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-3.5 mt-1 bg-gradient-to-r from-amber-300 to-orange-500 border-none rounded-[10px] text-[#14100a] text-[15px] font-bold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-xs">
            <span className="flex-1 h-px bg-white/10" />
            <ShieldCheck size={14} />
            <span>Secure Access</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
