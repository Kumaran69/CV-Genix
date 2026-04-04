import { useState } from "react";
import {
  Briefcase, MapPin, DollarSign, Clock, Zap, ExternalLink,
  Sparkles, RefreshCw, Search, Building2, TrendingUp,
  CheckCircle2, XCircle, AlertCircle, Loader2,
  BookmarkPlus, Send, Code2, Globe, Shield,
  ChevronRight,
} from "lucide-react";

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkillPill({ skill, matched, darkMode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      matched
        ? darkMode
          ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : darkMode
        ? "bg-red-900/40 text-red-400 border border-red-800"
        : "bg-red-50 text-red-600 border border-red-200"
    }`}>
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
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 24 24)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

// ─── Normalize job from either backend shape or Claude shape ─────────────────
function normalizeJob(job) {
  return {
    id:             job.id || job._id || Math.random().toString(36).slice(2),
    title:          job.title        || "Software Engineer",
    company:        job.company      || "Company",
    location:       job.location     || "Remote",
    type:           job.type         || job.employmentType || "Full-time",
    // Backend sends salary as string "$90k – $120k", Claude sends salaryMin/Max numbers
    salaryMin:      job.salaryMin    || null,
    salaryMax:      job.salaryMax    || null,
    salaryString:   job.salary       || null,
    matchScore:     job.match        || job.matchScore || 75,
    matchedSkills:  job.matchedSkills|| job.skills     || [],
    missingSkills:  job.missingSkills|| [],
    description:    job.description  || "",
    postedDays:     job.postedDays   || null,
    postedAt:       job.postedAt     || null,
    applicants:     job.applicants   || null,
    industry:       job.industry     || "Tech",
    isHot:          job.isHot        || false,
    isEasyApply:    job.isEasyApply  || false,
    recruiterName:  job.recruiterName|| null,
    recruiterTitle: job.recruiterTitle|| null,
    applyUrl:       job.applyUrl     || "#",
  };
}

function formatSalary(job) {
  if (job.salaryString) return job.salaryString;
  if (job.salaryMin && job.salaryMax)
    return `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k/yr`;
  return "Salary not listed";
}

function formatPosted(job) {
  if (job.postedDays) return `${job.postedDays}d ago`;
  if (job.postedAt) {
    const days = Math.floor((Date.now() - new Date(job.postedAt)) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }
  return "Recently";
}

// ─── Job Card ────────────────────────────────────────────────────────────────
function JobCard({ job: rawJob, darkMode, onApply, index }) {
  const job = normalizeJob(rawJob);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const t = darkMode
    ? { card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400" }
    : { card: "bg-white border-gray-100",    text: "text-gray-900", sub: "text-gray-500" };

  const IndustryIcon = {
    Tech: Code2, Finance: DollarSign, Healthcare: Shield,
    "E-commerce": Globe, SaaS: Zap, Startup: TrendingUp,
  }[job.industry] || Briefcase;

  return (
    <div
      className={`${t.card} border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
      style={{ animationDelay: `${index * 60}ms`, animation: "slideUp 0.4s ease both" }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{
        background: job.matchScore >= 85
          ? "linear-gradient(90deg,#10b981,#059669)"
          : job.matchScore >= 70
          ? "linear-gradient(90deg,#3b82f6,#6366f1)"
          : "linear-gradient(90deg,#f59e0b,#f97316)",
      }} />

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
            style={{ background: `hsl(${(job.company.charCodeAt(0) * 37) % 360}, 60%, 50%)` }}
          >
            {job.company.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-sm leading-tight ${t.text}`}>{job.title}</h3>
              {job.isHot && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">🔥 Hot</span>
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
                <Clock className="w-3 h-3" /> {formatPosted(job)}
              </span>
            </div>
          </div>

          <MatchRing score={job.matchScore} />
        </div>

        {/* Salary + Type */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            darkMode ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-50 text-emerald-700"
          }`}>
            <DollarSign className="w-3 h-3" /> {formatSalary(job)}
          </span>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            {job.type}
          </span>
          <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            <IndustryIcon className="w-3 h-3" /> {job.industry}
          </span>
          {job.applicants && (
            <span className={`text-xs ${t.sub}`}>{job.applicants} applicants</span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className={`text-xs leading-relaxed ${t.sub} mb-4`}>{job.description}</p>
        )}

        {/* Skills */}
        {(job.matchedSkills.length > 0 || job.missingSkills.length > 0) && (
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
        )}

        {/* Expanded: recruiter */}
        {expanded && job.recruiterName && (
          <div className={`mb-4 p-3 rounded-xl border ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"
          }`}>
            <p className={`text-xs font-semibold ${t.text} mb-1`}>👤 Recruiter</p>
            <p className={`text-xs ${t.sub}`}>{job.recruiterName} · {job.recruiterTitle}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApply && onApply(job.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {job.applyUrl && job.applyUrl !== "#"
              ? <a href={job.applyUrl} target="_blank" rel="noreferrer">Apply Now</a>
              : "Apply Now"}
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
          {job.recruiterName && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2.5 rounded-xl border transition-colors ${
                darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}
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
        {[1,2,3].map((i) => <div key={i} className={`h-7 rounded-lg ${t} w-20`} />)}
      </div>
      <div className={`h-9 rounded-xl ${t} w-full`} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function JobList({
  jobs: propJobs = [],
  loading: propLoading = false,
  resumes = [],
  onApply,
  darkMode = false,
}) {
  const [searchTerm,  setSearchTerm]  = useState("");
  const [filterType,  setFilterType]  = useState("all");
  const [sortBy,      setSortBy]      = useState("match");

  const t = darkMode
    ? { card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400", input: "bg-gray-800 border-gray-700 text-white placeholder-gray-500" }
    : { card: "bg-white border-gray-100",    text: "text-gray-900", sub: "text-gray-500", input: "bg-white border-gray-200 text-gray-900 placeholder-gray-400" };

  // ✅ Use jobs from backend prop — no Claude API call needed
  const normalized = propJobs.map(normalizeJob);

  const displayed = normalized
    .filter((j) => {
      const matchesSearch =
        !searchTerm ||
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (filterType === "remote"     && j.location.toLowerCase().includes("remote")) ||
        (filterType === "hot"        && j.isHot) ||
        (filterType === "easy"       && j.isEasyApply) ||
        (filterType === "high-match" && j.matchScore >= 80);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "match")  return b.matchScore - a.matchScore;
      if (sortBy === "salary") return (b.salaryMax || 0) - (a.salaryMax || 0);
      if (sortBy === "recent") return (a.postedDays || 0) - (b.postedDays || 0);
      return 0;
    });

  const avgMatch = normalized.length > 0
    ? Math.round(normalized.reduce((s, j) => s + j.matchScore, 0) / normalized.length)
    : 0;

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className={`text-xl font-bold ${t.text} flex items-center gap-2`}>
            <Sparkles className="w-5 h-5 text-violet-500" /> Job Recommendations
          </h2>
          <p className={`text-sm ${t.sub} mt-1`}>
            {propLoading
              ? "Loading job matches…"
              : normalized.length > 0
              ? `${normalized.length} jobs matched · ${avgMatch}% avg match`
              : "No jobs loaded yet"}
          </p>
        </div>
      </div>

      {/* Summary chips */}
      {!propLoading && normalized.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label: `${normalized.filter((j) => j.matchScore >= 80).length} High Match`, bg:"#d1fae5", color:"#065f46", border:"#a7f3d0" },
            { label: `${normalized.filter((j) => j.isHot).length} Hot Jobs`,              bg:"#fee2e2", color:"#991b1b", border:"#fecaca" },
            { label: `${normalized.filter((j) => j.isEasyApply).length} Easy Apply`,      bg:"#dbeafe", color:"#1e40af", border:"#bfdbfe" },
            { label: `${normalized.filter((j) => j.location.toLowerCase().includes("remote")).length} Remote`, bg:"#ede9fe", color:"#5b21b6", border:"#ddd6fe" },
          ].map(({ label, bg, color, border }) => (
            <span key={label} className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: bg, color, border: `1px solid ${border}` }}>
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className={`${t.card} border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
          <input type="text" placeholder="Search jobs, companies, locations…"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${t.input}`}
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${t.input}`}>
          <option value="all">All Jobs</option>
          <option value="high-match">High Match (80%+)</option>
          <option value="hot">Hot Jobs 🔥</option>
          <option value="easy">Easy Apply ⚡</option>
          <option value="remote">Remote Only</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${t.input}`}>
          <option value="match">Sort: Best Match</option>
          <option value="salary">Sort: Highest Salary</option>
          <option value="recent">Sort: Most Recent</option>
        </select>
      </div>

      {/* Loading */}
      {propLoading && (
        <div>
          <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-2xl mb-6">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin flex-shrink-0" />
            <p className="text-sm font-semibold text-violet-800">Loading job recommendations…</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map((i) => <LoadingSkeleton key={i} darkMode={darkMode} />)}
          </div>
        </div>
      )}

      {/* Empty */}
      {!propLoading && displayed.length === 0 && (
        <div className={`${t.card} border border-dashed rounded-2xl p-14 text-center`}>
          <Briefcase className={`w-10 h-10 mx-auto mb-3 ${t.sub}`} />
          <h3 className={`font-semibold ${t.text} mb-1`}>
            {searchTerm || filterType !== "all" ? "No results found" : "No jobs available"}
          </h3>
          <p className={`text-sm ${t.sub}`}>
            {searchTerm || filterType !== "all" ? "Try clearing your filters" : "Add skills to your resume to get job matches"}
          </p>
        </div>
      )}

      {/* Job Grid */}
      {!propLoading && displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} darkMode={darkMode} onApply={onApply} />
          ))}
        </div>
      )}

      {!propLoading && normalized.length > 0 && (
        <p className={`text-xs text-center ${t.sub} mt-6`}>
          Showing {displayed.length} of {normalized.length} matched positions
        </p>
      )}
    </div>
  );
}