import { useEffect, useState, useContext, useCallback } from "react";
import { getResumes, deleteResume } from "../services/api.js";
import { getJobRecommendations, getMarketAnalytics } from "../services/jobService.js";
import { calculateATSScore } from "../services/atsService.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, Eye, FileText, Search, Filter,
  Briefcase, Clock, TrendingUp, LogOut, Settings,
  Sun, Moon, Sparkles, Zap, Target, Trophy,
  DollarSign, ExternalLink, Shield,
} from "lucide-react";

import JobList        from "../components/job-recommendations/JobList";
import MarketDashboard from "../components/market-analytics/MarketDashboard";
import ATSDashboard   from "../components/ats/ATSDashboard";
import KeywordOptimizer from "../components/ats/KeywordOptimizer";


export default function Dashboard() {
  const { token, logoutUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resumes,          setResumes]          = useState([]);
  const [filteredResumes,  setFilteredResumes]  = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedFilter,   setSelectedFilter]   = useState("all");
  const [darkMode,         setDarkMode]         = useState(false);
  const [showProfileMenu,  setShowProfileMenu]  = useState(false);
  const [activeTab,        setActiveTab]        = useState("resumes");

  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [marketAnalytics,    setMarketAnalytics]    = useState(null);
  const [loadingJobs,        setLoadingJobs]        = useState(false);
  const [loadingMarket,      setLoadingMarket]      = useState(false);

  const [selectedResumeForATS, setSelectedResumeForATS] = useState(null);
  const [atsAnalysis,          setAtsAnalysis]          = useState(null);

  const [stats, setStats] = useState({
    total: 0, completed: 0, jobMatches: 0,
    marketDemand: 0, avgSalary: 0, trendingSkills: [],
    avgATSScore: 0, atsPassRate: 0,
  });

  // ── Helpers ───────────────────────────────────────────────────────────

  const getUserDisplayName = () => {
    if (!user) return "there";
    return user.name || user.googleName || user.githubUsername ||
      (user.email ? user.email.split("@")[0] : "there");
  };

  const getUserInitials = () => getUserDisplayName().charAt(0).toUpperCase();

  const calculateCompletion = useCallback((resume) => {
    if (resume.completionPercentage !== undefined) return resume.completionPercentage;
    let c = 0;
    if (resume.personal?.name)          c += 20;
    if (resume.personal?.email)         c += 10;
    if (resume.personal?.phone)         c += 10;
    if (resume.experience?.length > 0)  c += 25;
    if (resume.education?.length > 0)   c += 20;
    if (resume.skills?.length > 0)      c += 15;
    return Math.min(c, 100);
  }, []);

  const extractAllSkills = useCallback((list) => {
    const s = new Set();
    (Array.isArray(list) ? list : []).forEach((r) => {
      (r.skills || []).forEach((sk) =>
        s.add(typeof sk === "string" ? sk.toLowerCase() : sk.name?.toLowerCase())
      );
    });
    return Array.from(s).filter(Boolean);
  }, []);

  const formatDate = (d) => {
    if (!d) return "Recently";
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7)  return `${diff}d ago`;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
  };

  const statusLabel = (p) => p >= 95 ? "Ready" : p >= 50 ? "In Progress" : "Draft";
  const statusColor = (p) =>
    p >= 95 ? "from-emerald-400 to-green-500"
    : p >= 50 ? "from-amber-400 to-orange-400"
    : "from-blue-400 to-indigo-400";

  const getResumeATSScore = useCallback((resume) => {
    const analysis = calculateATSScore(resume);
    return analysis.totalScore;
  }, []);

  // ── Safe ID extractor ────────────────────────────────────────────────
  const getResumeId = (resume) => {
    if (!resume) return null;
    const raw = resume._id || resume.id;
    if (!raw) return null;
    if (typeof raw === "object" && raw.$oid) return raw.$oid;
    const str = String(raw);
    return str && str !== "undefined" && str !== "null" ? str : null;
  };

  // ── Navigation handlers ───────────────────────────────────────────────

  // ✅ Edit → /builder/:id
 // ✅ Should be this (relative path — React Router handles it)
const handleEdit = (resume) => {
  const id = getResumeId(resume);
  if (!id) return;
  navigate(`/builder/${id}`);  // ← just /builder/:id, no domain
};

  // ✅ Preview → /preview/:id
  const handlePreview = (resume) => {
    const id = getResumeId(resume);
    if (!id) { console.error("Preview failed — no valid ID:", resume); return; }
    navigate(`/preview/${id}`);
  };

  // ✅ Delete
  const handleDelete = async (resume) => {
    const id = getResumeId(resume);
    if (!id) { console.error("Delete failed — no valid ID:", resume); return; }
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    try {
      await deleteResume(id, token);
      fetchResumes();
    } catch (e) { console.error("Delete error:", e); }
  };

  // ✅ ATS shield → select resume + switch to ATS tab
  const handleATSClick = (resume) => {
    setSelectedResumeForATS(resume);
    setAtsAnalysis(calculateATSScore(resume));
    setActiveTab("ats");
  };

  // ── Data fetching ─────────────────────────────────────────────────────

  const fetchJobRecommendations = useCallback(async (skills) => {
    try {
      setLoadingJobs(true);
      const res = await getJobRecommendations(token, skills);
      setJobRecommendations(res.data.jobs || []);
      setStats((p) => ({ ...p, jobMatches: res.data.jobs?.length || 0 }));
    } catch (e) { console.error(e); } finally { setLoadingJobs(false); }
  }, [token]);

  const fetchMarketAnalytics = useCallback(async (skills) => {
    try {
      setLoadingMarket(true);
      const res = await getMarketAnalytics(token, skills);
      setMarketAnalytics(res.data);
      if (res.data) setStats((p) => ({
        ...p,
        marketDemand:  res.data.demandScore    || 0,
        avgSalary:     res.data.averageSalary  || 0,
        trendingSkills: res.data.trendingSkills || [],
      }));
    } catch (e) { console.error(e); } finally { setLoadingMarket(false); }
  }, [token]);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getResumes(token);
      const raw = res.data;
      const rawList = Array.isArray(raw) ? raw
        : Array.isArray(raw?.resumes) ? raw.resumes
        : Array.isArray(raw?.data)    ? raw.data
        : [];

      // Normalize — _id is always a plain string
      const list = rawList.map((r) => {
        const id = getResumeId(r);
        return { ...r, _id: id, id };
      });

      setResumes(list);
      setFilteredResumes(list);

      const completed = list.filter((r) => calculateCompletion(r) >= 95).length;
      const skills    = extractAllSkills(list);
      if (skills.length > 0) fetchJobRecommendations(skills);
      fetchMarketAnalytics(skills);

      let totalATS = 0, passing = 0;
      list.forEach((r) => {
        const s = getResumeATSScore(r);
        totalATS += s;
        if (s >= 75) passing++;
      });
      const avgATSScore = list.length > 0 ? Math.round(totalATS / list.length) : 0;
      const atsPassRate = list.length > 0 ? Math.round((passing / list.length) * 100) : 0;

      setStats((p) => ({ ...p, total: list.length, completed, avgATSScore, atsPassRate }));

      if (list.length > 0 && !selectedResumeForATS) {
        setSelectedResumeForATS(list[0]);
        setAtsAnalysis(calculateATSScore(list[0]));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token, calculateCompletion, extractAllSkills, fetchJobRecommendations,
      fetchMarketAnalytics, getResumeATSScore, selectedResumeForATS]);

  const applyFilters = useCallback((term, filter, list) => {
    let out = Array.isArray(list) ? list : [];
    if (term) out = out.filter((r) =>
      [r.personal?.name, r.personal?.title, r.template].some((v) =>
        v?.toLowerCase().includes(term.toLowerCase())
      )
    );
    if (filter !== "all") out = out.filter((r) => {
      const c = calculateCompletion(r);
      if (filter === "completed")   return c >= 95;
      if (filter === "in-progress") return c > 0 && c < 95;
      if (filter === "draft")       return c === 0;
      if (filter === "ai")          return r.aiEnhanced;
      if (filter === "ats-ready")   return getResumeATSScore(r) >= 75;
      return true;
    });
    setFilteredResumes(out);
  }, [calculateCompletion, getResumeATSScore]);

  const handleSearch       = (e) => { setSearchTerm(e.target.value); applyFilters(e.target.value, selectedFilter, resumes); };
  const handleFilterChange = (f) => { setSelectedFilter(f); applyFilters(searchTerm, f, resumes); };

  const handleResumeSelectForATS = (resume) => {
    setSelectedResumeForATS(resume);
    setAtsAnalysis(calculateATSScore(resume));
  };

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchResumes();
  }, [token, navigate, fetchResumes]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
      @keyframes fadeUp  { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
      @keyframes shimmer { 0%,100%{opacity:.6}50%{opacity:1} }
      @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:.5} }
      .fade-up   { animation: fadeUp .4s ease both; }
      .fade-up-1 { animation: fadeUp .4s .05s ease both; }
      .fade-up-2 { animation: fadeUp .4s .10s ease both; }
      .fade-up-3 { animation: fadeUp .4s .15s ease both; }
      .fade-up-4 { animation: fadeUp .4s .20s ease both; }
      .shimmer   { animation: shimmer 1.5s ease infinite; }
      .pulse-glow{ animation: pulse 2s ease-in-out infinite; }
      * { font-family: 'DM Sans', sans-serif; }
      .font-display { font-family: 'Syne', sans-serif; }
      .card-hover { transition: transform .2s, box-shadow .2s; }
      .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -12px rgba(0,0,0,.12); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const t = darkMode
    ? { bg:"bg-gray-950", card:"bg-gray-900 border-gray-800", text:"text-gray-100",
        sub:"text-gray-400", input:"bg-gray-800 border-gray-700 text-white placeholder-gray-500",
        chip:"bg-gray-800 text-gray-300", hover:"hover:bg-gray-800", divider:"border-gray-800" }
    : { bg:"bg-slate-50",  card:"bg-white border-gray-100",    text:"text-gray-900",
        sub:"text-gray-500", input:"bg-white border-gray-200 text-gray-900 placeholder-gray-400",
        chip:"bg-gray-100 text-gray-600", hover:"hover:bg-gray-50", divider:"border-gray-100" };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300`}>

      {/* ── TOP NAV ────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-30 ${darkMode ? "bg-gray-950/90" : "bg-white/90"} backdrop-blur border-b ${t.divider}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className={`font-display text-lg font-700 ${t.text}`}>CV Genix</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded">PRO</span>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "resumes",  label: "Resumes",                    icon: FileText },
              { id: "ats",      label: "ATS Score", icon: Shield,    badge: stats.avgATSScore },
              { id: "keywords", label: "Keywords",  icon: Sparkles },
              { id: "jobs",     label: `Jobs (${stats.jobMatches})`, icon: Briefcase },
              { id: "market",   label: "Market",    icon: TrendingUp },
            ].map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id ? "bg-blue-600 text-white shadow-sm" : `${t.sub} ${t.hover}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge !== undefined && activeTab !== id && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded ${
                    badge >= 85 ? "bg-emerald-500" : badge >= 75 ? "bg-blue-500" : "bg-amber-500"
                  } text-white`}>{badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${t.chip} ${t.hover} transition-colors`}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate("/builder")}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> New Resume
            </button>
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getUserInitials()}
              </button>
              {showProfileMenu && (
                <div className={`absolute right-0 top-11 w-52 rounded-xl border shadow-xl z-50 overflow-hidden ${t.card}`}>
                  <div className={`px-4 py-3 border-b ${t.divider}`}>
                    <p className={`font-semibold text-sm ${t.text}`}>{getUserDisplayName()}</p>
                    <p className={`text-xs truncate ${t.sub}`}>{user?.email}</p>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${t.text} ${t.hover} transition-colors`}>
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={logoutUser}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Welcome */}
        <div className="mb-8 fade-up">
          <h1 className={`font-display text-3xl md:text-4xl font-700 ${t.text} mb-1`}>
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              {getUserDisplayName()}
            </span>{" "}👋
          </h1>
          <p className={t.sub}>
            {stats.total === 0
              ? "Create your first resume to unlock job matches and market insights."
              : `You have ${stats.total} resume${stats.total !== 1 ? "s" : ""} · ${stats.avgATSScore}% avg ATS score.`}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label:"Total Resumes",  value: stats.total,                                                       icon:FileText,  color:"from-blue-500 to-indigo-500",   delay:"fade-up-1" },
            { label:"ATS Pass Rate",  value:`${stats.atsPassRate}%`, sub:`Avg: ${stats.avgATSScore}%`,           icon:Shield,    color: stats.avgATSScore >= 75 ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500", delay:"fade-up-2" },
            { label:"Job Matches",    value: stats.jobMatches,       sub:"Based on your skills",                 icon:Target,    color:"from-purple-500 to-pink-500",   delay:"fade-up-3" },
            { label:"Market Demand",  value:`${stats.marketDemand}%`,                                            icon:TrendingUp,color:"from-cyan-500 to-blue-500",     delay:"fade-up-4" },
            { label:"Avg. Salary",    value:`$${stats.avgSalary ? (stats.avgSalary/1000).toFixed(0)+"k" : "—"}`,sub:"For your skills", icon:DollarSign, color:"from-green-500 to-emerald-500", delay:"fade-up-4" },
          ].map(({ label, value, sub, icon: Icon, color, delay }) => (
            <div key={label} className={`${t.card} border rounded-2xl p-5 card-hover ${delay}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className={`text-2xl font-bold ${t.text}`}>{value}</p>
              <p className={`text-xs font-medium mt-0.5 ${t.sub}`}>{label}</p>
              {sub && <p className="text-xs text-emerald-500 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden gap-1 mb-6 overflow-x-auto pb-1">
          {[
            { id:"resumes",  label:"Resumes" },
            { id:"ats",      label:"ATS" },
            { id:"keywords", label:"Keywords" },
            { id:"jobs",     label:`Jobs (${stats.jobMatches})` },
            { id:"market",   label:"Market" },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id ? "bg-blue-600 text-white" : `${t.chip} ${t.hover}`
              }`}>{label}</button>
          ))}
        </div>

        {/* ── RESUMES TAB ─────────────────────────────────────────────── */}
        {activeTab === "resumes" && (
          <>
            {/* Search + Filter */}
            <div className={`${t.card} border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3`}>
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
                <input type="text" placeholder="Search resumes..." value={searchTerm}
                  onChange={handleSearch}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${t.input}`}
                />
              </div>
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
                <select value={selectedFilter} onChange={(e) => handleFilterChange(e.target.value)}
                  className={`pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${t.input}`}>
                  <option value="all">All</option>
                  <option value="completed">Ready</option>
                  <option value="in-progress">In Progress</option>
                  <option value="draft">Draft</option>
                  <option value="ai">AI Enhanced</option>
                  <option value="ats-ready">ATS Ready (75%+)</option>
                </select>
              </div>
            </div>

            {/* Resume Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map((i) => <div key={i} className={`${t.card} border rounded-2xl p-6 shimmer h-48`} />)}
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className={`${t.card} border border-dashed rounded-2xl p-14 text-center`}>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className={`font-semibold text-lg mb-1 ${t.text}`}>
                  {searchTerm || selectedFilter !== "all" ? "No results found" : "No resumes yet"}
                </h3>
                <p className={`text-sm mb-5 ${t.sub}`}>
                  {searchTerm || selectedFilter !== "all" ? "Try clearing your filters" : "Build your first resume in minutes"}
                </p>
                {!searchTerm && selectedFilter === "all" && (
                  <button onClick={() => navigate("/builder")}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
                    Create Resume
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResumes.map((resume, i) => {
                  const completion = calculateCompletion(resume);
                  const resumeId   = getResumeId(resume);
                  const atsScore   = getResumeATSScore(resume);

                  return (
                    <div key={resumeId || i}
                      className={`${t.card} border rounded-2xl p-5 card-hover relative overflow-hidden`}
                      style={{ animationDelay: `${i * 0.05}s` }}>

                      {/* ATS Badge */}
                      {atsScore >= 75 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                            atsScore >= 85 ? "bg-emerald-500" : "bg-blue-500"
                          } text-white text-xs font-bold shadow-lg pulse-glow`}>
                            <Shield className="w-3 h-3" />{atsScore}%
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusColor(completion)} flex items-center justify-center text-white font-bold text-sm`}>
                            {(resume.personal?.name || "R").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className={`font-semibold text-sm leading-tight ${t.text}`}>
                              {resume.personal?.name || "Untitled Resume"}
                            </h3>
                            <p className={`text-xs mt-0.5 ${t.sub}`}>
                              {resume.personal?.title || resume.title || "No title set"}
                            </p>
                          </div>
                        </div>
                        {resume.aiEnhanced && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                            <Sparkles className="w-3 h-3" /> AI
                          </span>
                        )}
                      </div>

                      {/* Completion bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={t.sub}>{statusLabel(completion)}</span>
                          <span className={`font-medium ${t.text}`}>{completion}%</span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <div className={`h-full rounded-full bg-gradient-to-r ${statusColor(completion)} transition-all duration-500`}
                            style={{ width:`${completion}%` }} />
                        </div>
                      </div>

                      {/* ATS bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={t.sub}>ATS Score</span>
                          <span className={`font-medium ${atsScore >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                            {atsScore}%
                          </span>
                        </div>
                        <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            atsScore >= 85 ? "bg-gradient-to-r from-emerald-400 to-green-500"
                            : atsScore >= 75 ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                            : "bg-gradient-to-r from-amber-400 to-orange-500"
                          }`} style={{ width:`${atsScore}%` }} />
                        </div>
                      </div>

                      {/* Meta */}
                      <div className={`flex items-center justify-between text-xs ${t.sub} mb-4`}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatDate(resume.updatedAt)}
                        </span>
                        {resume.template && (
                          <span className={`px-2 py-0.5 rounded-full ${t.chip}`}>{resume.template}</span>
                        )}
                      </div>

                      {/* ── Action Buttons ───────────────────────────── */}
                      <div className="flex items-center gap-2">

                        {/* ✅ Edit → navigates to /builder/:id */}
                        <button
                          onClick={() => handleEdit(resume)}
                          disabled={!resumeId}
                          title="Edit resume"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>

                        {/* ✅ ATS Shield → selects resume + switches to ATS tab */}
                        <button
                          onClick={() => handleATSClick(resume)}
                          title="View ATS analysis"
                          className={`p-2 rounded-lg border transition-colors ${
                            atsScore >= 75
                              ? "border-emerald-500 text-emerald-500 hover:bg-emerald-50"
                              : "border-amber-500 text-amber-500 hover:bg-amber-50"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* ✅ Preview → navigates to /preview/:id */}
                        <button
                          onClick={() => handlePreview(resume)}
                          disabled={!resumeId}
                          title="Preview resume"
                          className={`p-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            darkMode
                              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* ✅ Delete */}
                        <button
                          onClick={() => handleDelete(resume)}
                          disabled={!resumeId}
                          title="Delete resume"
                          className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Card */}
                <button onClick={() => navigate("/builder")}
                  className={`${t.card} border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-3 ${t.hover} transition-colors group min-h-[200px]`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-sm font-medium ${t.sub}`}>New Resume</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ATS TAB ──────────────────────────────────────────────────── */}
        {activeTab === "ats" && (
          <div className="space-y-6">
            {resumes.length > 0 && (
              <div className={`${t.card} border rounded-2xl p-4`}>
                <label className={`text-sm font-semibold ${t.text} mb-2 block`}>Select Resume to Analyze</label>
                <select
                  value={getResumeId(selectedResumeForATS) || ""}
                  onChange={(e) => {
                    const r = resumes.find((r) => getResumeId(r) === e.target.value);
                    if (r) handleResumeSelectForATS(r);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.input}`}>
                  {resumes.map((r) => {
                    const id = getResumeId(r);
                    return <option key={id} value={id}>{r.personal?.name || "Untitled Resume"} — {getResumeATSScore(r)}% ATS</option>;
                  })}
                </select>
              </div>
            )}
            <ATSDashboard atsAnalysis={atsAnalysis} darkMode={darkMode}
              onSectionClick={(section) => {
                const id = getResumeId(selectedResumeForATS);
                if (id) navigate(`/builder/${id}?section=${section}`);
              }} />
          </div>
        )}

        {/* ── KEYWORDS TAB ─────────────────────────────────────────────── */}
        {activeTab === "keywords" && (
          <div className="space-y-6">
            {resumes.length > 0 && (
              <div className={`${t.card} border rounded-2xl p-4`}>
                <label className={`text-sm font-semibold ${t.text} mb-2 block`}>Select Resume to Optimize</label>
                <select
                  value={getResumeId(selectedResumeForATS) || ""}
                  onChange={(e) => {
                    const r = resumes.find((r) => getResumeId(r) === e.target.value);
                    if (r) handleResumeSelectForATS(r);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.input}`}>
                  {resumes.map((r) => {
                    const id = getResumeId(r);
                    return <option key={id} value={id}>{r.personal?.name || "Untitled Resume"}</option>;
                  })}
                </select>
              </div>
            )}
            <KeywordOptimizer resume={selectedResumeForATS} darkMode={darkMode}
              onKeywordAdd={(kw) => console.log("Add keyword:", kw)}
              onKeywordRemove={(kw) => console.log("Remove keyword:", kw)} />
          </div>
        )}

        {/* ── JOBS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "jobs" && (
          <JobList jobs={jobRecommendations} loading={loadingJobs} resumes={resumes}
            onApply={(id) => alert(`Applying to job ${id}`)} darkMode={darkMode} />
        )}

        {/* ── MARKET TAB ───────────────────────────────────────────────── */}
        {activeTab === "market" && (
          <MarketDashboard analytics={marketAnalytics} loading={loadingMarket}
            darkMode={darkMode} userSkills={extractAllSkills(resumes)} />
        )}

        {/* ── BOTTOM STRIP ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">

          {/* Quick Actions */}
          <div className={`${t.card} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-semibold text-sm ${t.text}`}>Quick Actions</h3>
            </div>
            <div className="space-y-1">
              {[
                { label:"New Resume",        icon:Plus,        action:() => navigate("/builder") },
                { label:"Check ATS Score",   icon:Shield,      action:() => setActiveTab("ats") },
                { label:"Optimize Keywords", icon:Sparkles,    action:() => setActiveTab("keywords") },
                { label:"Find Jobs",         icon:ExternalLink,action:() => setActiveTab("jobs") },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={action}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${t.text} ${t.hover} transition-colors`}>
                  {label} <Icon className={`w-4 h-4 ${t.sub}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Trending Skills */}
          <div className={`${t.card} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-semibold text-sm ${t.text}`}>Trending Skills</h3>
            </div>
            {stats.trendingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.trendingSkills.slice(0, 6).map((sk, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    i < 2 ? "bg-emerald-100 text-emerald-700"
                    : i < 4 ? "bg-blue-100 text-blue-700"
                    : "bg-violet-100 text-violet-700"
                  }`}>{sk}{i < 2 ? " 🔥" : ""}</span>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${t.sub}`}>Add skills to your resume to see trends.</p>
            )}
          </div>

          {/* ATS Insight */}
          <div className={`${t.card} border rounded-2xl p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-semibold text-sm ${t.text}`}>ATS Insight</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t.sub}`}>Pass Rate</span>
                <span className={`text-sm font-bold ${stats.atsPassRate >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                  {stats.atsPassRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t.sub}`}>Avg Score</span>
                <span className={`text-sm font-bold ${stats.avgATSScore >= 75 ? "text-emerald-500" : "text-amber-500"}`}>
                  {stats.avgATSScore}%
                </span>
              </div>
              <button onClick={() => setActiveTab("ats")}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:shadow-md transition-all mt-2">
                Improve ATS Score
              </button>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        {resumes.length > 0 && stats.completed > 0 && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-300 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">
                  {stats.completed} resume{stats.completed !== 1 ? "s" : ""} ready · {stats.atsPassRate}% ATS pass rate!
                </p>
                <p className="text-blue-200 text-sm">{stats.jobMatches} matching positions waiting for you.</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setActiveTab("jobs")}
                className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                View Matches
              </button>
              <button onClick={() => navigate("/builder")}
                className="px-5 py-2.5 border border-white/40 text-white rounded-xl text-sm font-semibold hover:border-white/80 transition-all">
                New Resume
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}