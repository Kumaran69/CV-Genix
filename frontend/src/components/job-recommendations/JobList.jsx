import { useState } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Star,
  Filter,
  Search,
  Zap,
} from "lucide-react";

/**
 * JobList — displayed in Dashboard "Jobs" tab
 * Props:
 *  jobs        — array of job objects
 *  loading     — boolean
 *  resumes     — array (user's resumes, for context)
 *  onApply     — fn(jobId)
 *  darkMode    — boolean
 */
export default function JobList({ jobs = [], loading, resumes = [], onApply, darkMode }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const t = darkMode
    ? { card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400", input: "bg-gray-800 border-gray-700 text-white placeholder-gray-500", chip: "bg-gray-800 text-gray-300" }
    : { card: "bg-white border-gray-100", text: "text-gray-900", sub: "text-gray-500", input: "bg-white border-gray-200 text-gray-900 placeholder-gray-400", chip: "bg-gray-100 text-gray-600" };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || j.type?.toLowerCase() === typeFilter;
    return matchSearch && matchType;
  });

  const formatPosted = (d) => {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff}d ago`;
  };

  const matchColor = (score) =>
    score >= 85 ? "text-emerald-500 bg-emerald-50" :
    score >= 70 ? "text-amber-500 bg-amber-50" :
    "text-blue-500 bg-blue-50";

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${t.card} border rounded-2xl p-5 h-44 animate-pulse`} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={`${t.card} border border-dashed rounded-2xl p-14 text-center`}>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className={`font-semibold text-lg mb-2 ${t.text}`}>No job matches yet</h3>
        <p className={`text-sm ${t.sub}`}>
          Add skills to your resume to unlock personalised job recommendations.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${t.input}`}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none ${t.input}`}
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="contract">Contract</option>
          <option value="part-time">Part-time</option>
        </select>
      </div>

      <p className={`text-sm mb-4 ${t.sub}`}>
        {filtered.length} matching position{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((job) => (
          <div
            key={job._id}
            className={`${t.card} border rounded-2xl p-5 hover:shadow-md transition-all group`}
          >
            {/* Top Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {job.company?.charAt(0).toUpperCase() || "J"}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${t.text}`}>{job.title}</h3>
                  <p className={`text-xs ${t.sub}`}>{job.company}</p>
                </div>
              </div>
              {job.matchScore && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${matchColor(job.matchScore)}`}>
                  <Zap className="w-3 h-3" />
                  {job.matchScore}% match
                </span>
              )}
            </div>

            {/* Meta */}
            <div className={`flex flex-wrap gap-3 text-xs mb-3 ${t.sub}`}>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {job.salary}
                </span>
              )}
              {job.postedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatPosted(job.postedAt)}
                </span>
              )}
            </div>

            {/* Tags */}
            {job.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.chip}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => job.applyUrl && job.applyUrl !== "#" ? window.open(job.applyUrl, "_blank") : onApply(job._id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Apply Now
              </button>
              <button className={`p-2 rounded-lg border ${t.chip} hover:text-yellow-500 transition-colors`}>
                <Star className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}