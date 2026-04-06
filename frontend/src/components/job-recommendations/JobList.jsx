import { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  Building2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  BookmarkPlus,
  Send,
  ArrowUpRight,
  Code2,
  Globe,
  Shield,
} from "lucide-react";

// ─── Claude API Job Matcher ──────────────────────────────────────────────────
async function fetchJobsFromClaude(skills = [], resumeData = {}) {
  const skillList = skills.length > 0 ? skills.join(", ") : "general software development";
  const title = resumeData?.personal?.title || "";
  const experience = (resumeData?.experience || [])
    .slice(0, 2)
    .map((e) => `${e.position || e.title || ""} at ${e.company || ""}`)
    .join("; ");

  const prompt = `You are a recruiter CRM system. Based on the candidate profile below, generate 8 highly relevant, realistic job recommendations.

Candidate Profile:
- Skills: ${skillList}
- Current/Target Title: ${title || "Software Engineer"}
- Experience: ${experience || "Not specified"}

Return ONLY a valid JSON array (no markdown, no explanation) with exactly 8 job objects. Each object must have these fields:
{
  "id": "unique_string",
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, State or Remote",
  "type": "Full-time" | "Part-time" | "Contract" | "Remote",
  "salaryMin": number (annual USD, no commas),
  "salaryMax": number (annual USD, no commas),
  "matchScore": number (60-99, how well skills match),
  "matchedSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["skill1", "skill2"],
  "description": "2-sentence job description",
  "postedDays": number (1-30),
  "applicants": number (10-500),
  "industry": "Tech" | "Finance" | "Healthcare" | "E-commerce" | "SaaS" | "Startup",
  "isHot": boolean,
  "isEasyApply": boolean,
  "recruiterName": "First Last",
  "recruiterTitle": "Senior Recruiter" | "Talent Acquisition" | "HR Manager"
}

Make jobs realistic, from well-known companies (FAANG, unicorns, well-funded startups), and directly relevant to the skills provided. Vary locations, salary ranges, and company sizes.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const raw = data.content?.find((b) => b.type === "text")?.text || "[]";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkillPill({ skill, matched, darkMode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        matched
          ? darkMode
            ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : darkMode
          ? "bg-red-900/40 text-red-400 border border-red-800"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {matched ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
      {skill}
    </span>
  );
}

function MatchRing({ score, size = 56 }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 85 ? "#10b981" : score >= 70 ? "#3b82f6" : score >= 55 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
}

function JobCard({ job, darkMode, onApply, index }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = darkMode
    ? { card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400", hover: "hover:bg-gray-800" }
    : { card: "bg-white border-gray-100", text: "text-gray-900", sub: "text-gray-500", hover: "hover:bg-gray-50" };

  const industryIcon = {
    Tech: Code2, Finance: DollarSign, Healthcare: Shield,
    "E-commerce": Globe, SaaS: Zap, Startup: TrendingUp,
  }[job.industry] || Briefcase;
  const IndustryIcon = industryIcon;

  return (
    <div
      className={`${t.card} border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
      style={{ animationDelay: `${index * 60}ms`, animation: "slideUp 0.4s ease both" }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background:
            job.matchScore >= 85
              ? "linear-gradient(90deg,#10b981,#059669)"
              : job.matchScore >= 70
              ? "linear-gradient(90deg,#3b82f6,#6366f1)"
              : "linear-gradient(90deg,#f59e0b,#f97316)",
        }}
      />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
            style={{
              background: `hsl(${(job.company.charCodeAt(0) * 37) % 360}, 60%, 50%)`,
            }}
          >
            {job.company.slice(0, 2).toUpperCase()}
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-sm leading-tight ${t.text}`}>{job.title}</h3>
              {job.isHot && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  🔥 Hot
                </span>
              )}
              {job.isEasyApply && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Zap className="w-2.5 h-2.5" /> Easy Apply
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`flex items-center gap-1 text-xs ${t.sub}`}>
                <Building2 className="w-3 h-3" /> {job.company}
              </span>
              <span className={`flex items-center gap-1 text-xs ${t.sub}`}>
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
              <span className={`flex items-center gap-1 text-xs ${t.sub}`}>
                <Clock className="w-3 h-3" /> {job.postedDays}d ago
              </span>
            </div>
          </div>

          {/* Match Ring */}
          <MatchRing score={job.matchScore} />
        </div>

        {/* Salary + Type */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <DollarSign className="w-3 h-3" />
            {(job.salaryMin / 1000).toFixed(0)}k – {(job.salaryMax / 1000).toFixed(0)}k/yr
          </span>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            {job.type}
          </span>
          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            <IndustryIcon className="w-3 h-3" /> {job.industry}
          </span>
          <span className={`text-xs ${t.sub}`}>{job.applicants} applicants</span>
        </div>

        {/* Description */}
        <p className={`text-xs leading-relaxed ${t.sub} mb-4`}>{job.description}</p>

        {/* Matched Skills */}
        <div className="mb-4">
          <p className={`text-xs font-semibold ${t.sub} mb-2`}>Skill Match</p>
          <div className="flex flex-wrap gap-1.5">
            {job.matchedSkills.slice(0, 4).map((s) => (
              <SkillPill key={s} skill={s} matched darkMode={darkMode} />
            ))}
            {job.missingSkills.slice(0, 2).map((s) => (
              <SkillPill key={s} skill={s} matched={false} darkMode={darkMode} />
            ))}
          </div>
        </div>

        {/* Expanded: Recruiter info */}
        {expanded && (
          <div
            className={`mb-4 p-3 rounded-xl border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"
            }`}
          >
            <p className={`text-xs font-semibold ${t.text} mb-1`}>👤 Recruiter Contact</p>
            <p className={`text-xs ${t.sub}`}>{job.recruiterName} · {job.recruiterTitle}</p>
            <p className={`text-xs text-blue-500 mt-1 cursor-pointer hover:underline`}>
              View LinkedIn profile →
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApply(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Apply Now
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2.5 rounded-xl border transition-colors ${
              saved
                ? "border-amber-400 bg-amber-50 text-amber-500"
                : darkMode
                ? "border-gray-700 text-gray-400 hover:bg-gray-800"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2.5 rounded-xl border transition-colors ${
              darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ darkMode }) {
  const t = darkMode ? "bg-gray-800" : "bg-gray-100";
  return (
    <div className={`${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-5 animate-pulse`}>
      <div className="flex gap-4 mb-4">
        <div className={`w-11 h-11 rounded-xl ${t}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 rounded-lg ${t} w-2/3`} />
          <div className={`h-3 rounded-lg ${t} w-1/2`} />
        </div>
        <div className={`w-14 h-14 rounded-full ${t}`} />
      </div>
      <div className={`h-3 rounded-lg ${t} w-full mb-2`} />
      <div className={`h-3 rounded-lg ${t} w-4/5 mb-4`} />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => <div key={i} className={`h-7 rounded-lg ${t} w-20`} />)}
      </div>
      <div className={`h-9 rounded-xl ${t} w-full`} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function JobList({ jobs: propJobs = [], loading: propLoading = false, resumes = [], onApply, darkMode = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [lastFetched, setLastFetched] = useState(null);
  const hasFetched = useRef(false);

  const t = darkMode
    ? { bg: "bg-gray-950", card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400", input: "bg-gray-800 border-gray-700 text-white placeholder-gray-500", chip: "bg-gray-800 text-gray-300" }
    : { bg: "bg-slate-50", card: "bg-white border-gray-100", text: "text-gray-900", sub: "text-gray-500", input: "bg-white border-gray-200 text-gray-900 placeholder-gray-400", chip: "bg-gray-100 text-gray-600" };

  // Extract skills from all resumes
  const extractSkills = () => {
    const skills = new Set();
    resumes.forEach((r) => {
      (r.skills || []).forEach((sk) => {
        const name = typeof sk === "string" ? sk : sk?.name;
        if (name) skills.add(name.toLowerCase());
      });
    });
    return Array.from(skills);
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const skills = extractSkills();
      const primaryResume = resumes[0] || {};
      const fetched = await fetchJobsFromClaude(skills, primaryResume);
      setJobs(fetched);
      setLastFetched(new Date());
    } catch (e) {
      console.error("Job fetch error:", e);
      setError("Could not load job recommendations. Check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount or when resumes change
  useEffect(() => {
    if (!hasFetched.current && (resumes.length > 0 || true)) {
      hasFetched.current = true;
      loadJobs();
    }
  }, [resumes]);

  // Filter + sort
  const displayed = jobs
    .filter((j) => {
      const matchesSearch =
        !searchTerm ||
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (filterType === "remote" && j.location.toLowerCase().includes("remote")) ||
        (filterType === "hot" && j.isHot) ||
        (filterType === "easy" && j.isEasyApply) ||
        (filterType === "high-match" && j.matchScore >= 80);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "salary") return b.salaryMax - a.salaryMax;
      if (sortBy === "recent") return a.postedDays - b.postedDays;
      return 0;
    });

  const avgMatch = jobs.length > 0
    ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length)
    : 0;

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className={`text-xl font-bold ${t.text} flex items-center gap-2`}>
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Job Recommendations
          </h2>
          <p className={`text-sm ${t.sub} mt-1`}>
            {loading
              ? "Claude is analyzing your skills…"
              : jobs.length > 0
              ? `${jobs.length} jobs matched · ${avgMatch}% avg match · ${lastFetched ? `Updated ${Math.round((Date.now() - lastFetched) / 60000)}m ago` : ""}`
              : "No jobs loaded yet"}
          </p>
        </div>
        <button
          onClick={loadJobs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Fetching…" : "Refresh"}
        </button>
      </div>

      {/* ── Summary Chips ── */}
      {!loading && jobs.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label: `${jobs.filter((j) => j.matchScore >= 80).length} High Match`, color: "emerald" },
            { label: `${jobs.filter((j) => j.isHot).length} Hot Jobs`, color: "red" },
            { label: `${jobs.filter((j) => j.isEasyApply).length} Easy Apply`, color: "blue" },
            { label: `${jobs.filter((j) => j.location.toLowerCase().includes("remote")).length} Remote`, color: "purple" },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700 border border-${color}-200`}
              style={{
                background: { emerald: "#d1fae5", red: "#fee2e2", blue: "#dbeafe", purple: "#ede9fe" }[color],
                color: { emerald: "#065f46", red: "#991b1b", blue: "#1e40af", purple: "#5b21b6" }[color],
                border: `1px solid`,
                borderColor: { emerald: "#a7f3d0", red: "#fecaca", blue: "#bfdbfe", purple: "#ddd6fe" }[color],
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Search + Filters ── */}
      <div className={`${t.card} border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
          <input
            type="text"
            placeholder="Search jobs, companies, locations…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all ${t.input}`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${t.input}`}
        >
          <option value="all">All Jobs</option>
          <option value="high-match">High Match (80%+)</option>
          <option value="hot">Hot Jobs 🔥</option>
          <option value="easy">Easy Apply ⚡</option>
          <option value="remote">Remote Only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${t.input}`}
        >
          <option value="match">Sort: Best Match</option>
          <option value="salary">Sort: Highest Salary</option>
          <option value="recent">Sort: Most Recent</option>
        </select>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={loadJobs} className="ml-auto text-sm text-red-600 font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div>
          <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-2xl mb-6">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-800">Claude is matching your profile…</p>
              <p className="text-xs text-violet-600 mt-0.5">Analyzing skills, experience, and market demand</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} darkMode={darkMode} />)}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && displayed.length === 0 && (
        <div className={`${t.card} border border-dashed rounded-2xl p-14 text-center`}>
          <Briefcase className={`w-10 h-10 mx-auto mb-3 ${t.sub}`} />
          <h3 className={`font-semibold ${t.text} mb-1`}>
            {searchTerm || filterType !== "all" ? "No results found" : "No jobs loaded"}
          </h3>
          <p className={`text-sm ${t.sub} mb-4`}>
            {searchTerm || filterType !== "all" ? "Try clearing filters" : "Click Refresh to fetch AI-matched jobs"}
          </p>
          <button
            onClick={loadJobs}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            Fetch Jobs
          </button>
        </div>
      )}

      {/* ── Job Grid ── */}
      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} darkMode={darkMode} onApply={onApply} />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      {!loading && jobs.length > 0 && (
        <p className={`text-xs text-center ${t.sub} mt-6`}>
          ✨ Recommendations powered by Claude AI · Based on your resume skills
        </p>
      )}
    </div>
  );
}