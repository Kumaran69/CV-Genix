import { useState, useContext } from "react";
import { signup, login } from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle,
  CheckCircle, ArrowRight, Loader2, Shield, Check, Zap, Star, Globe
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Signup() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName]                         = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [error, setError]                       = useState("");
  const [success, setSuccess]                   = useState("");
  const [loading, setLoading]                   = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField]         = useState("");

  const validatePassword = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8)           strength += 25;
    if (/[A-Z]/.test(pwd))         strength += 25;
    if (/[0-9]/.test(pwd))         strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd))  strength += 25;
    setPasswordStrength(strength);
    return strength >= 75;
  };

  const strengthColor = () => {
    if (passwordStrength >= 75) return "linear-gradient(90deg,#10b981,#34d399)";
    if (passwordStrength >= 50) return "linear-gradient(90deg,#f59e0b,#fbbf24)";
    if (passwordStrength >= 25) return "linear-gradient(90deg,#f97316,#fb923c)";
    return "linear-gradient(90deg,#ef4444,#f87171)";
  };

  const strengthLabel = () => {
    if (passwordStrength >= 75) return { text: "Strong 💪",    color: "#34d399" };
    if (passwordStrength >= 50) return { text: "Medium ⚡",    color: "#fbbf24" };
    if (passwordStrength >= 25) return { text: "Weak ⚠️",      color: "#fb923c" };
    return                             { text: "Very Weak 🔴", color: "#f87171" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!validatePassword(password)) { setError("Password is too weak. Use 8+ characters with uppercase, numbers, and special characters."); return; }
    setLoading(true);
    try {
      await signup({ name, email, password });
      setSuccess("Account created! Logging you in…");
      const loginRes = await login({ email, password });
      loginUser(loginRes.data.token, loginRes.data.user);
      await new Promise((r) => setTimeout(r, 1000));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/google", { access_token: tokenResponse.access_token });
        loginUser(res.data.token, res.data.user);
        navigate("/dashboard");
      } catch { setError("Google signup failed. Please try again."); }
    },
    onError: () => setError("Google signup failed. Please try again."),
  });

  const inputStyle = (field, extra = {}) => ({
    width: "100%",
    padding: "13px 16px 13px 44px",
    background: focusedField === field ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.05)",
    border: `1.5px solid ${focusedField === field ? "rgba(129,140,248,0.7)" : "rgba(148,163,184,0.2)"}`,
    borderRadius: 12,
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    caretColor: "#818cf8",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
    ...extra,
  });

  const iconStyle = (field) => ({
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none", display: "flex",
    color: focusedField === field ? "#a5b4fc" : "rgba(148,163,184,0.5)",
    transition: "color 0.2s",
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0a0f2e 50%, #020817 100%)" }}>

      {/* ── Aurora blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="animate-blob absolute rounded-full"
          style={{ width: 700, height: 700, top: "-20%", left: "-15%", opacity: 0.35,
            background: "radial-gradient(circle, #4338ca 0%, #7c3aed 40%, transparent 70%)",
            filter: "blur(90px)", animationDuration: "20s" }} />
        <div className="animate-blob absolute rounded-full"
          style={{ width: 600, height: 600, bottom: "-15%", right: "-15%", opacity: 0.3,
            background: "radial-gradient(circle, #0ea5e9 0%, #6366f1 40%, transparent 70%)",
            filter: "blur(80px)", animationDuration: "25s", animationDelay: "4s", animationDirection: "reverse" }} />
        <div className="animate-blob absolute rounded-full"
          style={{ width: 500, height: 500, top: "40%", left: "35%", opacity: 0.2,
            background: "radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)",
            filter: "blur(100px)", animationDuration: "30s", animationDelay: "8s" }} />
      </div>

      {/* ── Grid ── */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* ── Floating particles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-float"
            style={{
              left: `${5 + (i * 6) % 90}%`, top: `${5 + (i * 7) % 85}%`,
              width: `${2 + (i % 4)}px`, height: `${2 + (i % 4)}px`,
              background: ["rgba(139,92,246,0.6)","rgba(99,102,241,0.5)","rgba(14,165,233,0.5)","rgba(236,72,153,0.4)"][i % 4],
              animationDelay: `${(i * 0.4) % 3}s`, animationDuration: `${2.5 + (i % 4) * 0.5}s`,
            }} />
        ))}
      </div>

      {/* ══ MAIN LAYOUT ════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">

          {/* ══ LEFT PANEL ═════════════════════════════════════════════════ */}
          <div className="space-y-5">
            {/* Hero card */}
            <div className="rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(15,18,45,0.97) 0%, rgba(20,14,50,0.97) 100%)",
                border: "1.5px solid rgba(129,140,248,0.3)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
              <div className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #0ea5e9)" }} />
              <div className="p-7">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                  style={{ background: "rgba(99,102,241,0.18)", border: "1px solid rgba(129,140,248,0.35)" }}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <span className="text-xs font-bold" style={{ color: "#c4b5fd" }}>Trusted by 10,000+ professionals</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl font-black leading-tight mb-4"
                  style={{ color: "#f8fafc", letterSpacing: "-0.02em" }}>
                  Build a Resume
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    That Gets Hired
                  </span>
                </h1>

                <p className="text-base leading-relaxed mb-6"
                  style={{ color: "rgba(203,213,225,0.85)" }}>
                  Create stunning, ATS-optimized resumes in minutes. Join thousands of professionals landing their dream jobs.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { value: "10K+", label: "Users"        },
                    { value: "95%",  label: "Success Rate" },
                    { value: "Free", label: "Forever"      },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-2xl"
                      style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(129,140,248,0.22)" }}>
                      <p className="text-xl font-black" style={{
                        background: "linear-gradient(135deg, #a5b4fc, #c084fc)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>{stat.value}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: "rgba(203,213,225,0.65)" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2.5">
                  {[
                    { icon: <Zap size={14} />,    title: "Real-time Preview",  desc: "See your resume update as you type", color: "#fbbf24" },
                    { icon: <Shield size={14} />,  title: "ATS-Optimized",      desc: "Beat applicant tracking systems",   color: "#34d399" },
                    { icon: <Globe size={14} />,   title: "5 Pro Templates",    desc: "Modern, Classic, Minimal & more",   color: "#60a5fa" },
                    { icon: <Check size={14} />,   title: "100% Free",          desc: "No credit card. No hidden fees.",   color: "#c084fc" },
                  ].map((feat) => (
                    <div key={feat.title}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-default"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.28)"; e.currentTarget.style.transform = "translateX(5px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${feat.color}22`, color: feat.color, border: `1px solid ${feat.color}44` }}>
                        {feat.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{feat.title}</p>
                        <p className="text-xs" style={{ color: "rgba(203,213,225,0.55)" }}>{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-5 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(79,70,229,0.22) 0%, rgba(124,58,237,0.18) 100%)",
                border: "1.5px solid rgba(129,140,248,0.28)",
                backdropFilter: "blur(20px)",
              }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff" }}>R</div>
                <div>
                  <p className="text-sm italic leading-relaxed mb-2"
                    style={{ color: "rgba(226,232,240,0.9)" }}>
                    "Got 3 interview calls within a week of using CV Genix. The templates are absolutely stunning!"
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold" style={{ color: "#a5b4fc" }}>Rahul K.</p>
                    <span style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                    <p className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>Software Engineer</p>
                    <div className="flex ml-1 gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} color="#fbbf24" fill="#fbbf24" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT FORM ══════════════════════════════════════════════════ */}
          <div>
            <div className="rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(12,16,40,0.97) 0%, rgba(18,12,44,0.97) 100%)",
                border: "1.5px solid rgba(129,140,248,0.28)",
                backdropFilter: "blur(30px)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.06), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
              {/* Animated top bar */}
              <div className="h-1 w-full animate-gradient-rotate"
                style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #0ea5e9, #4f46e5)", backgroundSize: "300% 100%" }} />

              {/* Header */}
              <div className="pt-7 px-7 pb-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", boxShadow: "0 6px 24px rgba(99,102,241,0.5)" }}>
                  <UserPlus size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-black" style={{ color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                    Create Account
                  </h2>
                  <p className="text-xs font-medium" style={{ color: "rgba(165,180,252,0.6)" }}>
                    Start your journey — it's free forever ✨
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pt-5 pb-7">

                {/* Error */}
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.35)" }}>
                    <AlertCircle size={15} color="#f87171" className="flex-shrink-0" />
                    <span className="text-xs font-semibold" style={{ color: "#fca5a5" }}>{error}</span>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.35)" }}>
                    <CheckCircle size={15} color="#34d399" className="flex-shrink-0" />
                    <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>{success}</span>
                  </div>
                )}

                {/* Name + Email */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "rgba(165,180,252,0.75)" }}>Full Name</label>
                    <div className="relative">
                      <span style={iconStyle("name")}><User size={15} /></span>
                      <input type="text" value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField("")}
                        required placeholder="Your name"
                        style={inputStyle("name")} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "rgba(165,180,252,0.75)" }}>Email</label>
                    <div className="relative">
                      <span style={iconStyle("email")}><Mail size={15} /></span>
                      <input type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        required placeholder="you@example.com"
                        style={inputStyle("email")} />
                    </div>
                  </div>
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "rgba(165,180,252,0.75)" }}>Password</label>
                    <div className="relative">
                      <span style={iconStyle("password")}><Lock size={15} /></span>
                      <input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        required placeholder="••••••••"
                        style={inputStyle("password", { paddingRight: 44 })} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex transition-colors duration-200"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.45)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#a5b4fc"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(148,163,184,0.45)"}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "rgba(165,180,252,0.75)" }}>Confirm</label>
                    <div className="relative">
                      <span style={iconStyle("confirm")}><Lock size={15} /></span>
                      <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField("")}
                        required placeholder="••••••••"
                        style={{
                          ...inputStyle("confirm", { paddingRight: 44 }),
                          borderColor: confirmPassword && password !== confirmPassword ? "rgba(239,68,68,0.6)" : focusedField === "confirm" ? "rgba(129,140,248,0.7)" : "rgba(148,163,184,0.2)",
                          boxShadow: confirmPassword && password !== confirmPassword ? "0 0 0 3px rgba(239,68,68,0.12)" : focusedField === "confirm" ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                        }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex transition-colors duration-200"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.45)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#a5b4fc"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(148,163,184,0.45)"}>
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] mt-1 font-semibold" style={{ color: "#f87171" }}>✗ Passwords don't match</p>
                    )}
                  </div>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="mb-3 p-4 rounded-2xl animate-fade-in"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(129,140,248,0.2)" }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: "rgba(165,180,252,0.7)" }}>Strength</span>
                      <span className="text-xs font-black" style={{ color: strengthLabel().color }}>
                        {strengthLabel().text}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden mb-3"
                      style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${passwordStrength}%`, background: strengthColor() }} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "8+ chars",    test: password.length >= 8          },
                        { label: "Uppercase",   test: /[A-Z]/.test(password)         },
                        { label: "Number",      test: /[0-9]/.test(password)         },
                        { label: "Special char",test: /[^A-Za-z0-9]/.test(password) },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                          style={{
                            background: req.test ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                            color: req.test ? "#34d399" : "rgba(148,163,184,0.5)",
                            border: `1px solid ${req.test ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                          <span>{req.test ? "✓" : "○"}</span>{req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl mb-4"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(129,140,248,0.2)" }}>
                  <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0"
                    style={{ accentColor: "#818cf8" }} />
                  <label htmlFor="terms" className="text-xs cursor-pointer leading-relaxed"
                    style={{ color: "rgba(203,213,225,0.75)" }}>
                    I agree to the{" "}
                    <a href="#" className="font-bold underline-offset-2 underline" style={{ color: "#a5b4fc" }}>Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="font-bold underline-offset-2 underline" style={{ color: "#a5b4fc" }}>Privacy Policy</a>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 mb-5"
                  style={{
                    background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
                    boxShadow: loading ? "none" : "0 4px 28px rgba(99,102,241,0.5), 0 0 0 1px rgba(139,92,246,0.3)",
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(99,102,241,0.65), 0 0 0 1px rgba(139,92,246,0.4)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 28px rgba(99,102,241,0.5), 0 0 0 1px rgba(139,92,246,0.3)"; }}>
                  <span className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /><span>Creating Account…</span></>
                    : <><UserPlus size={16} /><span>Create My Free Account</span><ArrowRight size={14} /></>
                  }
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(129,140,248,0.15)" }} />
                  <span className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "rgba(148,163,184,0.38)" }}>or sign up with</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(129,140,248,0.15)" }} />
                </div>

                {/* Social */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    {
                      label: "Google", onClick: () => googleSignup(),
                      icon: (
                        <svg width="17" height="17" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      ),
                    },
                    {
                      label: "GitHub", onClick: () => { window.location.href = "http://localhost:5000/auth/github"; },
                      icon: (
                        <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      ),
                    },
                  ].map(({ label, onClick, icon }) => (
                    <button key={label} type="button" onClick={onClick}
                      className="py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(148,163,184,0.2)", color: "rgba(226,232,240,0.8)", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.14)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.color = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.color = "rgba(226,232,240,0.8)"; e.currentTarget.style.boxShadow = "none"; }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>

                {/* Login link */}
                <div className="text-center py-3 px-4 rounded-2xl"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(129,140,248,0.18)" }}>
                  <span className="text-sm font-medium" style={{ color: "rgba(203,213,225,0.65)" }}>
                    Already have an account?{" "}
                  </span>
                  <Link to="/login" className="text-sm font-black transition-colors duration-200"
                    style={{ color: "#a5b4fc" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#a5b4fc"}>
                    Sign in here →
                  </Link>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-xs font-medium" style={{ color: "rgba(148,163,184,0.35)" }}>
              By signing up, you agree to our{" "}
              <a href="#" style={{ color: "rgba(165,180,252,0.55)" }}>Terms</a>,{" "}
              <a href="#" style={{ color: "rgba(165,180,252,0.55)" }}>Privacy Policy</a>, and{" "}
              <a href="#" style={{ color: "rgba(165,180,252,0.55)" }}>Cookie Policy</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}