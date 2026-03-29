import {
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  BarChart3,
  Zap,
  ArrowUpRight,
} from "lucide-react";

/**
 * MarketDashboard — displayed in Dashboard "Market" tab
 * Props:
 *  analytics   — object from getMarketAnalytics
 *  loading     — boolean
 *  darkMode    — boolean
 *  userSkills  — string[]
 */
export default function MarketDashboard({ analytics, loading, darkMode, userSkills = [] }) {
  const t = darkMode
    ? { card: "bg-gray-900 border-gray-800", text: "text-gray-100", sub: "text-gray-400", bar: "bg-gray-700" }
    : { card: "bg-white border-gray-100", text: "text-gray-900", sub: "text-gray-500", bar: "bg-gray-100" };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${t.card} border rounded-2xl p-5 h-44 animate-pulse`} />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`${t.card} border border-dashed rounded-2xl p-14 text-center`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-7 h-7 text-amber-400" />
        </div>
        <h3 className={`font-semibold text-lg mb-2 ${t.text}`}>No market data yet</h3>
        <p className={`text-sm ${t.sub}`}>Add skills to your resume to see market analytics.</p>
      </div>
    );
  }

  const maxSalary = Math.max(...(analytics.salaryBySkill?.map((s) => s.salary) || [1]));
  const maxDemand = Math.max(...(analytics.demandByMonth?.map((m) => m.demand) || [1]));
  const maxJobs = Math.max(...(analytics.topLocations?.map((l) => l.jobs) || [1]));

  return (
    <div className="space-y-6">

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Market Demand Score",
            value: `${analytics.demandScore ?? 0}%`,
            icon: TrendingUp,
            color: "from-amber-500 to-orange-500",
            note: analytics.demandScore > 70 ? "High demand 🔥" : analytics.demandScore > 40 ? "Moderate" : "Low demand",
            noteColor: analytics.demandScore > 70 ? "text-emerald-500" : analytics.demandScore > 40 ? "text-amber-500" : "text-red-500",
          },
          {
            label: "Average Salary",
            value: `$${analytics.averageSalary ? (analytics.averageSalary / 1000).toFixed(0) + "k" : "—"}`,
            icon: DollarSign,
            color: "from-purple-500 to-pink-500",
            note: "For your skill set",
            noteColor: "text-purple-500",
          },
          {
            label: "Job Growth (YoY)",
            value: `+${analytics.jobGrowth ?? 0}%`,
            icon: ArrowUpRight,
            color: "from-blue-500 to-indigo-500",
            note: "Year over year",
            noteColor: "text-blue-500",
          },
        ].map(({ label, value, icon: Icon, color, note, noteColor }) => (
          <div key={label} className={`${t.card} border rounded-2xl p-5`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${t.text}`}>{value}</p>
            <p className={`text-xs ${t.sub} mt-0.5`}>{label}</p>
            <p className={`text-xs font-medium mt-1 ${noteColor}`}>{note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Salary by Skill */}
        {analytics.salaryBySkill?.length > 0 && (
          <div className={`${t.card} border rounded-2xl p-5`}>
            <h3 className={`font-semibold text-sm mb-4 ${t.text}`}>Salary by Skill</h3>
            <div className="space-y-3">
              {analytics.salaryBySkill.map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${t.text}`}>{item.skill}</span>
                    <span className={`text-xs font-bold text-purple-500`}>
                      ${(item.salary / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${t.bar}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-700"
                      style={{ width: `${(item.salary / maxSalary) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demand Trend */}
        {analytics.demandByMonth?.length > 0 && (
          <div className={`${t.card} border rounded-2xl p-5`}>
            <h3 className={`font-semibold text-sm mb-4 ${t.text}`}>Demand Trend (6 months)</h3>
            <div className="flex items-end gap-2 h-28">
              {analytics.demandByMonth.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs font-bold ${t.sub}`}>{item.demand}%</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-amber-400 to-orange-300 transition-all duration-700"
                    style={{ height: `${(item.demand / maxDemand) * 80}px` }}
                  />
                  <span className={`text-xs ${t.sub}`}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Locations */}
        {analytics.topLocations?.length > 0 && (
          <div className={`${t.card} border rounded-2xl p-5`}>
            <h3 className={`font-semibold text-sm mb-4 ${t.text}`}>Top Hiring Locations</h3>
            <div className="space-y-3">
              {analytics.topLocations.map((loc, i) => (
                <div key={loc.city}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium flex items-center gap-1 ${t.text}`}>
                      <MapPin className="w-3 h-3 text-blue-400" />
                      {loc.city}
                    </span>
                    <span className={`text-xs ${t.sub}`}>{loc.jobs.toLocaleString()} jobs</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${t.bar}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-700"
                      style={{ width: `${(loc.jobs / maxJobs) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Skills */}
        {analytics.trendingSkills?.length > 0 && (
          <div className={`${t.card} border rounded-2xl p-5`}>
            <h3 className={`font-semibold text-sm mb-4 ${t.text}`}>Trending Skills Right Now</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.trendingSkills.map((skill, i) => {
                const isUserSkill = userSkills.includes(skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                      isUserSkill
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                        : i < 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i < 2 && <Zap className="w-3 h-3" />}
                    {skill}
                    {isUserSkill && <span className="ml-0.5">✓</span>}
                  </span>
                );
              })}
            </div>
            <p className={`text-xs mt-4 ${t.sub}`}>
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                You have
              </span>
              {" "}{userSkills.filter((s) => analytics.trendingSkills?.map((t) => t.toLowerCase()).includes(s)).length} of {analytics.trendingSkills.length} trending skills
            </p>
          </div>
        )}

      </div>
    </div>
  );
}