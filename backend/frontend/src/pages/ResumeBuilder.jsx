import { useState, useEffect, useContext, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ResumeForm from "../components/ResumeForm.jsx";
import ResumePreview from "../components/ResumePreview.jsx";
import { createResume, updateResume, getResumeById, API } from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
// Note: token is handled automatically by the API interceptor in api.js
import {
  Save,
  Download,
  Eye,
  EyeOff,
  Palette,
  Sparkles,
  Undo2,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
  Layers,
  Zap,
  FileText,
} from "lucide-react";

// ─────────────────────────────────────────────
// Default resume shape
// ─────────────────────────────────────────────
const DEFAULT_RESUME = {
  personal: {
    name: "", title: "", email: "", phone: "",
    location: "", address: "", city: "", country: "",
    postalCode: "", linkedin: "", github: "", portfolio: "", summary: "",
  },
  skills: [], education: [], experience: [],
  projects: [], certifications: [], languages: [],
  hobbies: [], references: [], template: "classic",
};

// ─────────────────────────────────────────────
// Sections — used for completion + jump logic
// ─────────────────────────────────────────────
// const SECTIONS = [
//   { key: "personal",   label: "Personal",   icon: "👤" },
//   { key: "experience", label: "Experience", icon: "💼" },
//   { key: "education",  label: "Education",  icon: "🎓" },
//   { key: "skills",     label: "Skills",     icon: "⚡" },
//   { key: "projects",   label: "Projects",   icon: "🚀" },
// ];

// ─────────────────────────────────────────────
// Completion calculator
// ─────────────────────────────────────────────
function calcCompletion(data) {
  let score = 0;
  const p = data.personal;
  if (p.name)    score += 15;
  if (p.title)   score += 10;
  if (p.email)   score += 10;
  if (p.phone)   score += 5;
  if (p.summary) score += 10;
  if (data.experience?.length > 0)    score += 25;
  if (data.education?.length > 0)     score += 15;
  if (data.skills?.length > 0)        score += 10;
  return Math.min(score, 100);
}

// ─────────────────────────────────────────────
// Check if a section is filled
// ─────────────────────────────────────────────
function isSectionFilled(key, data) {
  if (key === "personal") return !!(data.personal?.name && data.personal?.email);
  return Array.isArray(data[key]) && data[key].length > 0;
}

// ─────────────────────────────────────────────
// Find first incomplete section index
// ─────────────────────────────────────────────
function findFirstIncompleteSection(data) {
  const idx = SECTIONS.findIndex((s) => !isSectionFilled(s.key, data));
  return idx === -1 ? SECTIONS.length - 1 : idx;
}

// ─────────────────────────────────────────────
// Merge fetched resume onto default shape
// ─────────────────────────────────────────────
function mergeResume(raw) {
  return {
    personal: {
      name:       raw.personal?.name       || "",
      title:      raw.personal?.title      || "",
      email:      raw.personal?.email      || "",
      phone:      raw.personal?.phone      || "",
      location:   raw.personal?.location   || "",
      address:    raw.personal?.address    || "",
      city:       raw.personal?.city       || "",
      country:    raw.personal?.country    || "",
      postalCode: raw.personal?.postalCode || "",
      linkedin:   raw.personal?.linkedin   || "",
      github:     raw.personal?.github     || "",
      portfolio:  raw.personal?.portfolio  || "",
      summary:    raw.personal?.summary    || "",
    },
    skills:         raw.skills         || [],
    education:      raw.education      || [],
    experience:     raw.experience     || [],
    projects:       raw.projects       || [],
    certifications: raw.certifications || [],
    languages:      raw.languages      || [],
    hobbies:        raw.hobbies        || [],
    references:     raw.references     || [],
    template:       raw.template       || "classic",
  };
}

// ─────────────────────────────────────────────
// Format before API save
// ─────────────────────────────────────────────
function formatDataForSave(data) {
  const p = data.personal || {};

  const name = p.firstName || p.lastName
    ? `${p.firstName || ""} ${p.lastName || ""}`.trim()
    : p.name || "";

  const location = p.location ||
    [p.address, p.city, p.country].filter(Boolean).join(", ");

  const rawPhone = (p.phone || "").replace(/[^\d\+\s\-\(\)\.]/g, "");
  const phone = rawPhone.length >= 10 ? rawPhone : undefined;

  const personal = {
    name,
    email:     p.email     || undefined,
    phone,
    address:   p.address   || undefined,
    linkedin:  p.linkedin  || undefined,
    github:    p.github    || undefined,
    portfolio: p.portfolio || undefined,
    summary:   p.summary   || undefined,
  };

  const title = data.title || name || "My Resume";

  const skills = (data.skills || []).map((sk) => {
    if (typeof sk === "string") return { name: sk, level: "Intermediate", category: "Other" };
    return { name: sk.name || sk, level: sk.level || "Intermediate", category: sk.category || "Other" };
  }).filter((sk) => sk.name);

  const experience = (data.experience || [])
    .filter((ex) => ex.role && ex.company)
    .map((ex) => ({
      role:             ex.role,
      company:          ex.company,
      location:         ex.location         || undefined,
      employmentType:   ex.employmentType   || "Full-time",
      startDate:        ex.startDate        || new Date().toISOString(),
      endDate:          ex.endDate          || undefined,
      currentlyWorking: ex.currentlyWorking || false,
      description:      ex.description      || undefined,
      technologies:     ex.technologies     || [],
      achievements:     ex.achievements     || [],
    }));

  const education = (data.education || [])
    .filter((ed) => ed.degree && ed.institution)
    .map((ed) => ({
      degree:            ed.degree,
      institution:       ed.institution,
      location:          ed.location          || undefined,
      startDate:         ed.startDate         || undefined,
      endDate:           ed.endDate           || undefined,
      currentlyStudying: ed.currentlyStudying || false,
      gpa:               ed.gpa               || undefined,
      description:       ed.description       || undefined,
    }));

  const projects = (data.projects || [])
    .filter((pr) => pr.title)
    .map((pr) => ({
      title:              pr.title,
      description:        pr.description        || undefined,
      technologies:       pr.technologies       || [],
      startDate:          pr.startDate          || undefined,
      endDate:            pr.endDate            || undefined,
      currentlyWorkingOn: pr.currentlyWorkingOn || false,
      githubLink:         pr.githubLink || pr.github || undefined,
      liveLink:           pr.liveLink  || pr.live   || undefined,
      keyFeatures:        pr.keyFeatures || [],
    }));

  const certifications = (data.certifications || [])
    .filter((c) => c.name && c.issuer)
    .map((c) => ({
      name:          c.name,
      issuer:        c.issuer,
      issueDate:     c.issueDate     || undefined,
      expiryDate:    c.expiryDate    || undefined,
      credentialId:  c.credentialId  || undefined,
      credentialUrl: c.credentialUrl || undefined,
    }));

  const languages = (data.languages || [])
    .filter((l) => l.name || typeof l === "string")
    .map((l) => ({
      name:        typeof l === "string" ? l : l.name,
      proficiency: l.proficiency || "Professional",
    }));

  return {
    title,
    template: data.template || "classic",
    personal,
    skills,
    experience,
    education,
    projects,
    certifications,
    languages,
    isPublic: data.isPublic || false,
  };
}

// ─────────────────────────────────────────────
// Completion Ring SVG
// ─────────────────────────────────────────────
function CompletionRing({ pct }) {
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#34d399" : pct >= 40 ? "#60a5fa" : "#818cf8";
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="rotate-[-90deg]">
      <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(96,165,250,0.12)" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="10" fontWeight="700"
        style={{ transform: "rotate(90deg)", transformOrigin: "26px 26px" }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Section pill
// ─────────────────────────────────────────────
function SectionPill({ label, icon, filled, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        active
          ? "bg-blue-500/30 text-blue-100 border border-blue-400/60 scale-105"
          : filled
          ? "bg-blue-500/15 text-blue-200 border border-blue-400/35"
          : "bg-blue-950/40 text-blue-400/55 border border-blue-500/12"
      }`}
    >
      <span>{icon}</span>
      {label}
      {filled && <CheckCircle className="w-3 h-3 ml-0.5" />}
    </button>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ResumeBuilder() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();           // /builder/:id  when editing
  const { token } = useContext(AuthContext);

  const isEditing = Boolean(id);

  const [resumeData,      setResumeData]      = useState(DEFAULT_RESUME);
  const [resumeId,        setResumeId]        = useState(id || null);
  const [history,         setHistory]         = useState([]);
  const [previewMode,     setPreviewMode]     = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving,        setIsSaving]        = useState(false);
  const [isFetching,      setIsFetching]      = useState(isEditing);
  const [saveError,       setSaveError]       = useState("");
  const [lastSaved,       setLastSaved]       = useState(null);
  const [activeSection,   setActiveSection]   = useState("personal");

  const completion = calcCompletion(resumeData);

  // ── Fetch existing resume by ID from URL ──────────────────────────────
  useEffect(() => {
    // Priority 1: URL param ID  → fetch from API
    // Priority 2: location.state?.resume → passed directly (legacy support)
    // Priority 3: new resume

    if (id) {
      const load = async () => {
        try {
          setIsFetching(true);
          const res  = await getResumeById(id);          // token auto-attached by interceptor
          const raw  = res.data?.resume || res.data;
          const data = mergeResume(raw);
          setResumeData(data);
          setResumeId(id);

          // ✅ Jump to first INCOMPLETE section automatically
          const firstIncomplete = findFirstIncompleteSection(data);
          setActiveSection(SECTIONS[firstIncomplete].key);
        } catch (err) {
          console.error("Failed to load resume:", err.message);
          setSaveError("Could not load resume. Please go back and try again.");
        } finally {
          setIsFetching(false);
        }
      };
      load();
    } else if (location.state?.resume) {
      // Legacy: state was passed via navigate
      const data = mergeResume(location.state.resume);
      setResumeData(data);
      setResumeId(location.state.resume._id || location.state.resume.id || null);
      const firstIncomplete = findFirstIncompleteSection(data);
      setActiveSection(SECTIONS[firstIncomplete].key);
    }
  }, [id, token]);

  // ── Undo-aware updater ─────────────────────────────────────────────────
  const updateResumeData = useCallback((updater) => {
    setResumeData((prev) => {
      setHistory((h) => [prev, ...h.slice(0, 19)]);
      return typeof updater === "function" ? updater(prev) : updater;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const [last, ...rest] = h;
      setResumeData(last);
      return rest;
    });
  }, []);

  // Ctrl+Z
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); handleUndo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo]);

  // ── Save / Update ──────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      const formatted = formatDataForSave(resumeData);

      if (resumeId) {
        // ✅ Editing existing resume — PUT /resumes/:id
        const res = await updateResume(resumeId, formatted);
        // getFormattedData() returns 'id', not '_id' — handle both
        const updatedId = res.data?.resume?.id || res.data?.resume?._id || resumeId;
        setResumeId(updatedId);
      } else {
        // ✅ New resume — use /resumes/save (upsert by title) to avoid
        //    duplicate-title 400 errors on double-click or retry
        // Make title unique by appending timestamp if name is generic
        if (!formatted.title || formatted.title === "My Resume") {
          formatted.title = `Resume - ${new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}`;
        }
        const res = await API.post("/resumes/save", formatted);
        // getFormattedData() returns 'id' not '_id'
        const newId = res.data?.resume?.id || res.data?.resume?._id;
        if (newId) setResumeId(newId);
      }

      setLastSaved(new Date());
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 4000);
      setTimeout(() => navigate("/dashboard"), 1600);
    } catch (err) {
      // Surface the backend's specific validation errors if present
      const backendErrors = err.response?.data?.errors;
      const msg = backendErrors
        ? backendErrors.join(", ")
        : err.response?.data?.message || "Failed to save. Please try again.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const goToTemplates = () => navigate("/pages/TemplateSelection", { state: { resumeData } });

  // ── Loading state while fetching ──────────────────────────────────────
  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at 15% 20%, #0f1a35 0%, #080c18 60%, #050912 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-300 text-sm">Loading your resume…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .rb-root { font-family: 'Inter', sans-serif; --blue: #3b82f6; --blue-dim: rgba(59,130,246,0.12); --blue-glow: rgba(59,130,246,0.22); --emerald: #34d399; --indigo: #818cf8; --surface: rgba(10,22,40,0.88); --border: rgba(96,165,250,0.10); }
        .rb-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-40px) scale(1.08);} 66%{transform:translate(-20px,20px) scale(0.94);} }
        .animate-blob { animation: blob 14s infinite ease-in-out; }
        .delay-2 { animation-delay: 5s; } .delay-4 { animation-delay: 10s; }
        @keyframes slideUp { from{transform:translateY(24px);opacity:0;} to{transform:translateY(0);opacity:1;} }
        .animate-slide-up { animation: slideUp 0.35s ease forwards; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(52,211,153,0.45);} 70%{box-shadow:0 0 0 10px rgba(52,211,153,0);} 100%{box-shadow:0 0 0 0 rgba(52,211,153,0);} }
        .pulse-ring:not(:disabled):hover { animation: pulseRing 1.2s infinite; }
        .rb-scroll::-webkit-scrollbar{width:4px;} .rb-scroll::-webkit-scrollbar-track{background:transparent;} .rb-scroll::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.15);border-radius:4px;}
        .progress-fill { transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="rb-root min-h-screen relative text-white overflow-x-hidden"
        style={{ background: "radial-gradient(ellipse at 15% 20%, #0f1a35 0%, #080c18 60%, #050912 100%)" }}>

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="animate-blob absolute w-96 h-96 rounded-full" style={{ top:"10%",left:"5%",background:"radial-gradient(circle,#1d4ed8,transparent 70%)",filter:"blur(70px)",opacity:0.08 }} />
          <div className="animate-blob delay-2 absolute w-80 h-80 rounded-full" style={{ top:"40%",right:"8%",background:"radial-gradient(circle,#4338ca,transparent 70%)",filter:"blur(65px)",opacity:0.07 }} />
          <div className="animate-blob delay-4 absolute w-72 h-72 rounded-full" style={{ bottom:"15%",left:"40%",background:"radial-gradient(circle,#1e40af,transparent 70%)",filter:"blur(75px)",opacity:0.06 }} />
          <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(96,165,250,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.4) 1px,transparent 1px)",backgroundSize:"48px 48px",opacity:0.018 }} />
        </div>

        {/* Header */}
        <header className="relative z-20 px-6 py-4" style={{ borderBottom:"1px solid var(--border)",backdropFilter:"blur(12px)" }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-500/10 active:scale-95">
                <ArrowLeft className="w-5 h-5 text-blue-300/60" />
              </button>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ background:"linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="rb-display text-xl leading-tight font-bold" style={{ color:"#dbeafe" }}>
                  CV&thinsp;·&thinsp;Genix
                </h1>
                <p className="text-xs leading-none mt-0.5" style={{ color:"#4a6080" }}>
                  {isEditing ? "Editing resume" : "New resume"}
                  {resumeData.personal.name && (
                    <span style={{ color:"#93c5fd" }} className="ml-1">— {resumeData.personal.name}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex flex-wrap items-center gap-2">
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-xs mr-1" style={{ color:"#4a6080" }}>
                  <Clock className="w-3 h-3" />
                  Saved {lastSaved.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                </div>
              )}
              <button onClick={handleUndo} disabled={history.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-500/10 active:scale-95"
                style={{ border:"1px solid var(--border)",color:"#93c5fd" }} title="Undo (Ctrl+Z)">
                <Undo2 className="w-4 h-4" /> Undo
              </button>
              <button onClick={goToTemplates}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-500/10 active:scale-95"
                style={{ border:"1px solid var(--border)",color:"#93c5fd" }}>
                <Palette className="w-4 h-4 text-blue-400" /> Templates
              </button>
              <button onClick={() => setPreviewMode((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-500/10 active:scale-95"
                style={{ border:"1px solid var(--border)",color:"#93c5fd" }}>
                {previewMode ? <><EyeOff className="w-4 h-4 text-indigo-400" /> Hide Preview</>
                             : <><Eye className="w-4 h-4 text-indigo-400" /> Show Preview</>}
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="pulse-ring flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background:isSaving?"rgba(52,211,153,0.25)":"linear-gradient(135deg,#059669,#10b981)",boxShadow:"0 0 20px rgba(52,211,153,0.22)",color:"#fff" }}>
                {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                          : <><Save className="w-4 h-4" />{isEditing ? "Update" : "Save"}</>}
              </button>
            </div>
          </div>

          {/* Completion bar */}
          <div className="max-w-7xl mx-auto mt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium" style={{ color:"#4a6080" }}>Profile strength</span>
              <span className="text-xs font-semibold" style={{ color:completion>=80?"#34d399":completion>=40?"#60a5fa":"#818cf8" }}>
                {completion >= 80 ? "Strong" : completion >= 40 ? "Moderate" : "Getting started"}
              </span>
              <span className="text-xs ml-auto" style={{ color:"#4a6080" }}>{completion}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(96,165,250,0.08)" }}>
              <div className="h-full rounded-full progress-fill"
                style={{ width:`${completion}%`, background:completion>=80?"linear-gradient(90deg,#059669,#34d399)":completion>=40?"linear-gradient(90deg,#1d4ed8,#60a5fa)":"linear-gradient(90deg,#3730a3,#818cf8)" }} />
            </div>

            {/* ✅ Clickable section pills — click to jump to that section */}
            <div className="flex flex-wrap gap-2 mt-3">
              {SECTIONS.map((s) => (
                <SectionPill
                  key={s.key}
                  label={s.label}
                  icon={s.icon}
                  filled={isSectionFilled(s.key, resumeData)}
                  active={activeSection === s.key}
                  onClick={() => setActiveSection(s.key)}
                />
              ))}
            </div>

            {/* ✅ "Continue from" hint when editing */}
            {isEditing && (
              <p className="text-xs mt-2" style={{ color:"#4a6080" }}>
                {isSectionFilled("personal", resumeData) &&
                 isSectionFilled("experience", resumeData) &&
                 isSectionFilled("education", resumeData) &&
                 isSectionFilled("skills", resumeData) ? (
                  <span style={{ color:"#34d399" }}>✓ All sections complete — review and update as needed</span>
                ) : (
                  <span>
                    Continue from:{" "}
                    <span style={{ color:"#93c5fd" }} className="font-medium">
                      {SECTIONS.find((s) => !isSectionFilled(s.key, resumeData))?.label || "Review"}
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {saveError && (
            <div className="animate-fade-in flex items-center gap-3 mb-6 px-5 py-3.5 rounded-xl text-sm"
              style={{ background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.28)" }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-300">{saveError}</span>
              <button onClick={() => setSaveError("")} className="ml-auto text-red-400 hover:text-red-200 transition-colors text-lg leading-none">×</button>
            </div>
          )}

          <div className={`grid gap-6 transition-all duration-500 ${previewMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            {/* Form Panel */}
            <div className={previewMode ? "" : "max-w-3xl mx-auto w-full"}>
              <div className="rounded-2xl overflow-hidden animate-fade-in"
                style={{ background:"var(--surface)",border:"1px solid var(--border)",backdropFilter:"blur(16px)",boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.22)" }}>
                      <Layers className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color:"#dbeafe" }}>Resume Details</h2>
                      <p className="text-xs" style={{ color:"#4a6080" }}>
                        {isEditing ? `Editing — ${activeSection} section` : "Fill in your information below"}
                      </p>
                    </div>
                  </div>
                  <CompletionRing pct={completion} />
                </div>

                <div className="rb-scroll overflow-y-auto" style={{ maxHeight:"78vh" }}>
                  <div className="p-6">
                    <ResumeForm
                      resumeData={resumeData}
                      setResumeData={updateResumeData}
                      activeSection={activeSection}       // ✅ pass active section so form can scroll/focus
                      onSectionChange={setActiveSection}  // ✅ form can update active section as user scrolls
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            {previewMode && (
              <div className="lg:sticky lg:top-6 h-fit animate-fade-in">
                <div className="rounded-2xl overflow-hidden"
                  style={{ background:"var(--surface)",border:"1px solid var(--border)",backdropFilter:"blur(16px)",boxShadow:"0 32px 80px rgba(0,0,0,0.5)" }}>
                  <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.22)" }}>
                        <Eye className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold" style={{ color:"#dbeafe" }}>Live Preview</h2>
                        <p className="text-xs" style={{ color:"#4a6080" }}>Updates as you type</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.28)",color:"#93c5fd" }}>
                      <Sparkles className="w-3 h-3" />
                      {resumeData.template.charAt(0).toUpperCase() + resumeData.template.slice(1)}
                    </div>
                  </div>

                  <div className="rb-scroll overflow-y-auto" style={{ maxHeight:"65vh" }}>
                    <div className="p-6">
                      <ResumePreview resume={resumeData} />
                    </div>
                  </div>

                  <div className="px-6 py-4 flex flex-col sm:flex-row gap-3" style={{ borderTop:"1px solid var(--border)" }}>
                    <button onClick={handleSave} disabled={isSaving}
                      className="pulse-ring flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background:isSaving?"rgba(52,211,153,0.25)":"linear-gradient(135deg,#059669,#10b981)",boxShadow:"0 4px 20px rgba(52,211,153,0.25)",color:"#fff" }}>
                      {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                                : <><Save className="w-4 h-4" />{isEditing ? "Update Resume" : "Save Resume"}</>}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
                      style={{ background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",boxShadow:"0 4px 20px rgba(59,130,246,0.28)",color:"#fff" }}>
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>

                {/* Pro tip */}
                <div className="mt-4 rounded-xl px-5 py-4"
                  style={{ background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.18)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold" style={{ color:"#93c5fd" }}>Pro tip</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color:"#7eadd4" }}>
                    {completion < 40
                      ? "Start with your name, title, and a short summary — recruiters read the top third first."
                      : completion < 75
                      ? "Add at least 2 work experiences with quantified results to stand out."
                      : "Your resume looks great! Tailor the summary for each role you apply to."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Save Bar */}
          {!previewMode && (
            <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-4 sm:hidden"
              style={{ background:"rgba(8,12,24,0.94)",backdropFilter:"blur(16px)",borderTop:"1px solid var(--border)" }}>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff" }}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving…" : isEditing ? "Update" : "Save"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                  style={{ background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff" }}>
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Success Toast */}
        {showSaveSuccess && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="flex items-start gap-4 px-5 py-4 rounded-2xl text-sm"
              style={{ background:"linear-gradient(135deg,rgba(5,150,105,0.95),rgba(16,185,129,0.95))",backdropFilter:"blur(16px)",boxShadow:"0 20px 60px rgba(16,185,129,0.30),0 0 0 1px rgba(255,255,255,0.10)",minWidth:"280px" }}>
              <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{isEditing ? "Resume updated!" : "Resume saved!"}</p>
                <p className="text-emerald-100 text-xs mt-0.5">Redirecting to your dashboard…</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}