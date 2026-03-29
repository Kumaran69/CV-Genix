import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, Search, X, TrendingUp, Star, Zap } from "lucide-react";

// ─────────────────────────────────────────
// Design tokens (consistent with full app)
// ─────────────────────────────────────────
const C = {
  bgBase:       "#080c18",
  bgPrimary:    "#0d1220",
  bgCard:       "#111827",
  bgElevated:   "#161d2e",
  bgHover:      "#1c2438",
  border:       "rgba(148,163,184,0.10)",
  borderStrong: "rgba(148,163,184,0.18)",
  borderAccent: "rgba(59,130,246,0.32)",
  borderSel:    "rgba(59,130,246,0.55)",
  accent:       "#3b82f6",
  accentBright: "#60a5fa",
  accentDim:    "rgba(59,130,246,0.10)",
  accentGlow:   "rgba(59,130,246,0.18)",
  success:      "#10b981",
  successDim:   "rgba(16,185,129,0.12)",
  successGlow:  "rgba(16,185,129,0.22)",
  textPrimary:  "#f1f5f9",
  textSec:      "#94a3b8",
  textMuted:    "#475569",
  textAccent:   "#60a5fa",
};

// ─────────────────────────────────────────
// Template data
// ─────────────────────────────────────────
const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Professional & traditional — ideal for corporate and executive roles",
    category: "Professional",
    popularity: 95,
    features: ["All sections", "ATS friendly", "Corporate style"],
    previewAccent: "#1d4ed8",
    previewBg: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
    badge: "Most Used",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean & contemporary with a bold header — great for any industry",
    category: "Professional",
    popularity: 92,
    features: ["Color header", "Clean layout", "Two-column"],
    previewAccent: "#7c3aed",
    previewBg: "linear-gradient(135deg, #1e1b4b, #4338ca)",
    badge: "Popular",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple & elegant — lets your content speak for itself",
    category: "Minimalist",
    popularity: 85,
    features: ["Content-first", "Elegant spacing", "Clean typography"],
    previewAccent: "#0f766e",
    previewBg: "linear-gradient(135deg, #134e4a, #0f766e)",
    badge: null,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold & visual — designed for design, marketing and creative roles",
    category: "Creative",
    popularity: 88,
    features: ["Visual appeal", "Gradient accents", "Creative fields"],
    previewAccent: "#a21caf",
    previewBg: "linear-gradient(135deg, #581c87, #a21caf)",
    badge: null,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Modern developer-focused layout with clean information hierarchy",
    category: "Professional",
    popularity: 89,
    features: ["Tech focused", "Skills grid", "GitHub ready"],
    previewAccent: "#0369a1",
    previewBg: "linear-gradient(135deg, #0c4a6e, #0369a1)",
    badge: "Trending",
  },
];

const CATEGORIES = ["All", "Professional", "Creative", "Minimalist"];
const POPULAR_IDS = ["modern", "classic", "tech"];

// ─────────────────────────────────────────
// Resume skeleton preview (abstract wireframe)
// ─────────────────────────────────────────
function ResumeWireframe({ accent, bg }) {
  const line = (w, op = 0.25) => (
    <div style={{ height: 6, borderRadius: 3, background: `rgba(255,255,255,${op})`, width: w, marginBottom: 5 }} />
  );
  const block = (h, op = 0.15) => (
    <div style={{ height: h, borderRadius: 4, background: `rgba(255,255,255,${op})`, marginBottom: 6 }} />
  );

  return (
    <div style={{ background: bg, borderRadius: 8, overflow: "hidden", height: "100%", padding: 12, position: "relative" }}>
      {/* Header area */}
      <div style={{ marginBottom: 10 }}>
        {line("60%", 0.5)}
        {line("40%", 0.3)}
        {line("80%", 0.18)}
      </div>
      {/* Two-col content */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 2 }}>
          {block(5, 0.35)}
          {block(3)}
          {block(3)}
          <div style={{ height: 4 }} />
          {block(5, 0.35)}
          {block(3)}
          {block(3)}
        </div>
        <div style={{ flex: 1 }}>
          {block(5, 0.35)}
          {block(3)}
          {block(3)}
          {block(3)}
          <div style={{ height: 4 }} />
          {block(5, 0.35)}
          {block(3)}
          {block(3)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Template Card
// ─────────────────────────────────────────
function TemplateCard({ template, isSelected, onSelect }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => onSelect(template.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14,
        border: `1.5px solid ${isSelected ? C.borderSel : hover ? C.borderAccent : C.border}`,
        background: isSelected ? "rgba(59,130,246,0.07)" : hover ? C.bgHover : C.bgCard,
        cursor: "pointer",
        transition: "all 0.18s",
        transform: hover && !isSelected ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isSelected ? `0 0 0 3px ${C.accentDim}, 0 8px 24px rgba(0,0,0,0.3)` : hover ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Selected indicator line */}
      {isSelected && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #1d4ed8, #3b82f6, #6366f1)", borderRadius: "14px 14px 0 0" }} />
      )}

      <div style={{ padding: 16 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? C.accentBright : C.textPrimary }}>
                {template.name}
              </span>
              {template.badge && (
                <span style={{
                  fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "2px 6px", borderRadius: 4,
                  background: template.badge === "Trending" ? "rgba(217,119,6,0.15)" : C.accentDim,
                  color: template.badge === "Trending" ? "#fbbf24" : C.accentBright,
                  border: `1px solid ${template.badge === "Trending" ? "rgba(217,119,6,0.3)" : C.borderAccent}`,
                }}>
                  {template.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, color: C.textMuted }}>{template.category}</span>
          </div>

          {isSelected ? (
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 8px ${C.accentGlow}`,
            }}>
              <Check size={12} color="#fff" />
            </div>
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${C.border}` }} />
          )}
        </div>

        {/* Wireframe preview */}
        <div style={{ height: 100, marginBottom: 12, borderRadius: 8, overflow: "hidden" }}>
          <ResumeWireframe accent={template.previewAccent} bg={template.previewBg} />
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.55, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {template.description}
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {template.features.slice(0, 2).map((f, i) => (
            <span key={i} style={{
              fontSize: 10.5, padding: "2px 7px", borderRadius: 4, fontWeight: 500,
              background: "rgba(255,255,255,0.05)", color: C.textSec, border: `1px solid ${C.border}`,
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={11} color="#fbbf24" fill="#fbbf24" />
            <span style={{ fontSize: 12, color: C.textSec, fontWeight: 500 }}>{template.popularity}%</span>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.successDim, color: C.success, border: `1px solid rgba(16,185,129,0.22)` }}>
            FREE
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function TemplateSelection() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [selected,  setSelected]  = useState("classic");
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (location.state?.resumeData) {
      setResumeData(location.state.resumeData);
      setSelected(location.state.resumeData.template || "classic");
    }
  }, [location.state]);

  const filtered = TEMPLATES.filter(t => {
    const matchCat  = category === "All" || t.category === category;
    const matchText = t.name.toLowerCase().includes(search.toLowerCase()) ||
                      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  });

  const selectedData = TEMPLATES.find(t => t.id === selected);

  const applyTemplate = () => {
    const updated = resumeData ? { ...resumeData, template: selected } : { template: selected };
    navigate("/pages/ResumeBuilder", { state: { resume: updated } });
  };

  const goBack = () => {
    navigate("/pages/ResumeBuilder", { state: resumeData ? { resume: resumeData } : {} });
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .ts-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .ts-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.15); border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
      `}</style>

      <div className="ts-root" style={{
        minHeight: "100vh", color: C.textPrimary,
        background: `radial-gradient(ellipse at 15% 20%, #0f1a35 0%, ${C.bgBase} 65%)`,
        display: "flex", flexDirection: "column",
      }}>

        {/* ══════════════════════════════
            HEADER
        ══════════════════════════════ */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(8,12,24,0.88)", backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px" }}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={goBack}
                  style={{
                    padding: 8, borderRadius: 9, border: `1px solid ${C.border}`,
                    background: "transparent", cursor: "pointer", color: C.textMuted,
                    display: "flex", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = C.textPrimary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}
                >
                  <ArrowLeft size={16} />
                </button>

                <div>
                  <h1 className="ts-display" style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, lineHeight: 1.2 }}>
                    Choose Template
                  </h1>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
                    {TEMPLATES.length} professionally designed templates
                  </p>
                </div>
              </div>

              {/* Apply CTA — header */}
              <button
                onClick={applyTemplate}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 20px", borderRadius: 10, border: "none",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", boxShadow: `0 4px 16px ${C.successGlow}`,
                  transition: "all 0.15s", fontFamily: "inherit",
                }}
              >
                <Check size={15} />
                Apply — {selectedData?.name}
              </button>
            </div>

            {/* Search + category filter row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search templates…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "9px 36px 9px 36px",
                    background: C.bgPrimary, border: `1px solid ${C.border}`,
                    borderRadius: 9, color: C.textPrimary, fontSize: 13,
                    outline: "none", fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = C.borderAccent; e.target.style.boxShadow = `0 0 0 3px ${C.accentDim}`; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
                {CATEGORIES.map(cat => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "8px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                        border: `1px solid ${active ? C.borderAccent : C.border}`,
                        background: active ? C.accentDim : "rgba(255,255,255,0.02)",
                        color: active ? C.accentBright : C.textMuted,
                        cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                        fontFamily: "inherit",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════
            MAIN
        ══════════════════════════════ */}
        <main style={{ flex: 1, maxWidth: 1280, margin: "0 auto", padding: "28px 24px", width: "100%" }}>

          {/* Selected template preview card */}
          {selectedData && (
            <div className="fade-up" style={{
              borderRadius: 16, overflow: "hidden", marginBottom: 32,
              background: C.bgCard, border: `1px solid ${C.borderAccent}`,
              boxShadow: `0 0 0 1px ${C.accentDim}, 0 8px 32px rgba(0,0,0,0.35)`,
            }}>
              {/* Accent top bar */}
              <div style={{ height: 3, background: "linear-gradient(90deg, #1d4ed8, #3b82f6, #6366f1)" }} />

              <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {/* Preview thumb */}
                  <div style={{ width: 100, height: 70, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    <ResumeWireframe accent={selectedData.previewAccent} bg={selectedData.previewBg} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="ts-display" style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{selectedData.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: C.accentDim, color: C.accentBright, border: `1px solid ${C.borderAccent}` }}>
                        Selected
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: C.textSec, margin: "0 0 8px" }}>{selectedData.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {selectedData.features.map((f, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,0.05)", color: C.textSec, border: `1px solid ${C.border}` }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={applyTemplate}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "11px 24px", borderRadius: 10, border: "none",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "#fff", boxShadow: `0 4px 20px ${C.successGlow}`,
                    transition: "all 0.15s", fontFamily: "inherit", flexShrink: 0,
                  }}
                >
                  <Check size={16} />
                  Apply This Template
                </button>
              </div>
            </div>
          )}

          {/* Popular section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <TrendingUp size={15} color="#d97706" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.textPrimary }}>Most Popular</span>
              <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>Used by most job seekers</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {TEMPLATES.filter(t => POPULAR_IDS.includes(t.id)).map(t => (
                <TemplateCard key={t.id} template={t} isSelected={selected === t.id} onSelect={setSelected} />
              ))}
            </div>
          </div>

          {/* All templates */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.textPrimary }}>All Templates</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>
                {filtered.length} of {TEMPLATES.length} templates
              </span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px", borderRadius: 14, border: `1px dashed ${C.border}` }}>
                <Search size={36} color={C.textMuted} style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: C.textSec, marginBottom: 10 }}>No templates match your search</p>
                <button
                  onClick={() => { setSearch(""); setCategory("All"); }}
                  style={{ fontSize: 13, color: C.accentBright, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {filtered.map(t => (
                  <TemplateCard key={t.id} template={t} isSelected={selected === t.id} onSelect={setSelected} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ══════════════════════════════
            STICKY BOTTOM BAR
        ══════════════════════════════ */}
        <div style={{
          position: "sticky", bottom: 0, zIndex: 40,
          background: "rgba(8,12,24,0.94)", backdropFilter: "blur(16px)",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            padding: "12px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            {/* Selected info */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 28, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
                {selectedData && <ResumeWireframe accent={selectedData.previewAccent} bg={selectedData.previewBg} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                  {selectedData?.name} Template
                </p>
                <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>
                  {selectedData?.features.join(" · ")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={goBack}
                style={{
                  padding: "9px 18px", borderRadius: 9,
                  border: `1px solid ${C.border}`, background: "transparent",
                  color: C.textSec, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.15s", fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = C.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSec; }}
              >
                Back
              </button>

              <button
                onClick={applyTemplate}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 22px", borderRadius: 9, border: "none",
                  fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", boxShadow: `0 4px 16px ${C.successGlow}`,
                  transition: "all 0.15s", fontFamily: "inherit",
                }}
              >
                <Zap size={14} />
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}