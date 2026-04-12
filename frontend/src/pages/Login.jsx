import { useState, useContext } from "react";
import { login } from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Login() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      loginUser(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.message) setError(err.message);
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          access_token: tokenResponse.access_token,
        });
        loginUser(res.data.token, res.data.user);
        navigate("/dashboard");
      } catch {
        alert("Google login failed");
      }
    },
    onError: () => alert("Google login failed"),
  });

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden"
      style={{ background: "#03060f" }}
    >
      {/* ── Aurora blobs (uses tailwind animate-blob from your config) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-blob absolute rounded-full"
          style={{
            width: 650, height: 650, top: "-15%", left: "-12%", opacity: 0.3,
            background: "radial-gradient(circle, #4f46e5 0%, #7c3aed 45%, transparent 70%)",
            filter: "blur(80px)", animationDuration: "18s",
          }}
        />
        <div
          className="animate-blob absolute rounded-full"
          style={{
            width: 550, height: 550, top: "45%", right: "-12%", opacity: 0.22,
            background: "radial-gradient(circle, #0ea5e9 0%, #6366f1 45%, transparent 70%)",
            filter: "blur(80px)", animationDuration: "22s", animationDelay: "3s",
            animationDirection: "reverse",
          }}
        />
        <div
          className="animate-blob absolute rounded-full"
          style={{
            width: 480, height: 480, bottom: "-10%", left: "28%", opacity: 0.18,
            background: "radial-gradient(circle, #8b5cf6 0%, #ec4899 50%, transparent 70%)",
            filter: "blur(90px)", animationDuration: "26s", animationDelay: "6s",
          }}
        />
        <div
          className="animate-blob absolute rounded-full"
          style={{
            width: 320, height: 320, top: "18%", left: "52%", opacity: 0.14,
            background: "radial-gradient(circle, #06b6d4 0%, #3b82f6 50%, transparent 70%)",
            filter: "blur(70px)", animationDuration: "14s", animationDelay: "1s",
          }}
        />
      </div>

      {/* ── Grid overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Floating dots (uses animate-float from your config) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${8 + (i * 7.5) % 84}%`,
              top: `${10 + (i * 8) % 75}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: i % 2 === 0 ? "rgba(139,92,246,0.45)" : "rgba(99,102,241,0.35)",
              animationDelay: `${(i * 0.35) % 3}s`,
              animationDuration: `${3 + (i % 3) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[445px] animate-fade-in">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(8, 10, 24, 0.82)",
            border: "1px solid rgba(99,102,241,0.22)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow:
              "0 0 0 1px rgba(139,92,246,0.06), 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Animated gradient top bar */}
          <div
            className="h-[3px] w-full animate-gradient-rotate"
            style={{
              background: "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #0ea5e9, #4f46e5)",
              backgroundSize: "300% 100%",
            }}
          />

          {/* ── Header ── */}
          <div className="pt-10 px-10 text-center">
            <div
              className="w-[68px] h-[68px] rounded-2xl mx-auto mb-5 flex items-center justify-center animate-pulse-glow"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
              }}
            >
              <LogIn size={28} color="#fff" />
            </div>

            <h1
              className="text-[28px] font-extrabold tracking-tight mb-1.5"
              style={{
                background: "linear-gradient(135deg, #e2e8ff 0%, #a5b4fc 55%, #c4b5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome Back
            </h1>
            <p className="text-[13.5px]" style={{ color: "rgba(148,163,184,0.55)" }}>
              Sign in to continue to CV Genix
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="px-10 pt-7 pb-10">

            {/* Error */}
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.28)",
                }}
              >
                <AlertCircle size={15} color="#f87171" className="flex-shrink-0" />
                <span className="text-[13px] font-medium" style={{ color: "#fca5a5" }}>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="mb-5">
              <label
                className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex transition-colors duration-200"
                  style={{ color: focusedField === "email" ? "#818cf8" : "rgba(148,163,184,0.35)" }}
                >
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  required
                  placeholder="you@example.com"
                  className="w-full py-3.5 pl-11 pr-4 rounded-2xl text-[13.5px] outline-none transition-all duration-200"
                  style={{
                    background: focusedField === "email" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${focusedField === "email" ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.15)"}`,
                    boxShadow: focusedField === "email" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    color: "#e2e8f0",
                    caretColor: "#818cf8",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-8">
              <label
                className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex transition-colors duration-200"
                  style={{ color: focusedField === "password" ? "#818cf8" : "rgba(148,163,184,0.35)" }}
                >
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  required
                  placeholder="Enter your password"
                  className="w-full py-3.5 pl-11 pr-12 rounded-2xl text-[13.5px] outline-none transition-all duration-200"
                  style={{
                    background: focusedField === "password" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${focusedField === "password" ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.15)"}`,
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    color: "#e2e8f0",
                    caretColor: "#818cf8",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex transition-colors duration-200"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.4)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#818cf8"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(148,163,184,0.4)"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.35)"
                  : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
                boxShadow: loading ? "none" : "0 4px 24px rgba(99,102,241,0.42), 0 0 0 1px rgba(139,92,246,0.25)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 36px rgba(99,102,241,0.58), 0 0 0 1px rgba(139,92,246,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 24px rgba(99,102,241,0.42), 0 0 0 1px rgba(139,92,246,0.25)";
              }}
            >
              {/* Gloss overlay */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%)" }}
              />
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px" style={{ background: "rgba(99,102,241,0.13)" }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap"
                style={{ color: "rgba(148,163,184,0.32)" }}
              >
                or continue with
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(99,102,241,0.13)" }} />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                {
                  label: "Google",
                  onClick: () => googleLogin(),
                  icon: (
                    <svg width="17" height="17" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ),
                },
                {
                  label: "GitHub",
                  onClick: () => { window.location.href = "http://localhost:5000/auth/github"; },
                  icon: (
                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  ),
                },
              ].map(({ label, onClick, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="py-3 px-4 rounded-2xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(99,102,241,0.17)",
                    color: "rgba(226,232,240,0.75)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.09)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.38)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.color = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.17)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.color = "rgba(226,232,240,0.75)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Sign up */}
            <div className="text-center text-[13.5px]" style={{ color: "rgba(148,163,184,0.5)" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold transition-colors duration-200"
                style={{ color: "#818cf8" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a5b4fc"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#818cf8"}
              >
                Sign up now →
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[11.5px]" style={{ color: "rgba(148,163,184,0.27)" }}>
          By signing in, you agree to our{" "}
          <a href="#" style={{ color: "rgba(129,140,248,0.55)" }}>Terms of Service</a>{" "}
          and{" "}
          <a href="#" style={{ color: "rgba(129,140,248,0.55)" }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}