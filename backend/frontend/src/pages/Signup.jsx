import { useState, useContext, useEffect } from "react";
import { signup, login } from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle,
  CheckCircle, ArrowRight, Loader2, Shield, Check
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Signup() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [loading, setLoading]                 = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blob {
        0%   { transform: translate(0px,   0px)   scale(1);   }
        33%  { transform: translate(30px,  -50px) scale(1.1); }
        66%  { transform: translate(-20px,  20px) scale(0.9); }
        100% { transform: translate(0px,   0px)   scale(1);   }
      }
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0);     }
      }
      .animate-fade-in-up { animation: fadeIn 0.3s ease-out; }
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to   { opacity: 1; transform: translateX(0);     }
      }
      .animate-fade-in-left { animation: fadeInLeft 0.5s ease-out; }
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0);    }
      }
      .animate-fade-in-right { animation: fadeInRight 0.5s ease-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const validatePassword = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8)            strength += 25;
    if (/[A-Z]/.test(pwd))          strength += 25;
    if (/[0-9]/.test(pwd))          strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd))   strength += 25;
    setPasswordStrength(strength);
    return strength >= 75;
  };

  const strengthColor = () => {
    if (passwordStrength >= 75) return "bg-emerald-500";
    if (passwordStrength >= 50) return "bg-amber-500";
    if (passwordStrength >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  // ── Normal signup ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password is too weak. Use 8+ characters with uppercase, numbers, and special characters.");
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
      setSuccess("Account created! Logging you in…");

      const loginRes = await login({ email, password });
      loginUser(loginRes.data.token, loginRes.data.user); // ✅ pass both

      await new Promise((r) => setTimeout(r, 1000));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google signup ────────────────────────────────────────────────────────
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/google",
          { access_token: tokenResponse.access_token }
        );
        loginUser(res.data.token, res.data.user); // ✅ pass both
        navigate("/dashboard");
      } catch {
        setError("Google signup failed. Please try again.");
      }
    },
    onError: () => setError("Google signup failed. Please try again."),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* ── Left — Info panel ─────────────────────────────────────────── */}
          <div className="space-y-8 animate-fade-in-left">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                  <Shield className="w-12 h-12 text-emerald-600" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                  Start Building Your Future
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                  Join thousands of professionals who have created stunning resumes that land interviews
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Professional Templates", desc: "10+ ATS-friendly designs" },
                  { title: "Real-time Preview",      desc: "See changes instantly"    },
                  { title: "Export Multiple Formats",desc: "PDF, DOCX, and more"     },
                  { title: "Cloud Storage",          desc: "Access from anywhere"     },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Free Forever</h3>
                    <p className="text-sm text-gray-600">No credit card required. Create unlimited resumes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right — Form ──────────────────────────────────────────────── */}
          <div className="animate-fade-in-right">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30">
              {/* Header gradient */}
              <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <div className="bg-white p-4 rounded-2xl shadow-xl">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 rounded-xl">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Fill in your details to get started</p>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fade-in-up mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 animate-fade-in-up mb-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name + Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                        <input
                          type="text" value={name} onChange={(e) => setName(e.target.value)} required
                          className="block w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400"
                          placeholder="Enter Your Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                          className="block w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password + Confirm */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"} value={password}
                          onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }} required
                          className="block w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400"
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                        <input
                          type={showConfirm ? "text" : "password"} value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)} required
                          className={`block w-full pl-10 pr-12 py-3.5 border rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400 ${
                            confirmPassword && password !== confirmPassword
                              ? "border-red-400 focus:ring-red-400"
                              : "border-gray-300 focus:ring-emerald-500"
                          }`}
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {showConfirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  {/* Password strength */}
                  {password && (
                    <div className="space-y-2 animate-fade-in-up">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Password Strength</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength >= 75 ? "text-emerald-600" :
                          passwordStrength >= 50 ? "text-amber-600"   :
                          passwordStrength >= 25 ? "text-orange-600"  : "text-red-600"
                        }`}>
                          {passwordStrength >= 75 ? "Strong" : passwordStrength >= 50 ? "Medium" : passwordStrength >= 25 ? "Weak" : "Very Weak"}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strengthColor()} transition-all duration-300`} style={{ width: `${passwordStrength}%` }} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                        {[
                          { label: "8+ characters", test: password.length >= 8          },
                          { label: "Uppercase",     test: /[A-Z]/.test(password)         },
                          { label: "Number",        test: /[0-9]/.test(password)         },
                          { label: "Special char",  test: /[^A-Za-z0-9]/.test(password) },
                        ].map((req) => (
                          <div key={req.label} className={`flex items-center gap-2 text-xs p-2 rounded ${req.test ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${req.test ? "bg-emerald-500" : "bg-gray-300"}`} />
                            <span>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer" />
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Privacy Policy</a>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit" disabled={loading}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                      loading
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Account…</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button" onClick={() => googleSignup()}
                    className="p-3.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { window.location.href = "http://localhost:5000/auth/github"; }}
                    className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>

                {/* Login link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors inline-flex items-center gap-1 group">
                      Sign in here
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                By signing up, you agree to our{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Terms</a>,{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Privacy Policy</a>,{" "}and{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Cookie Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}