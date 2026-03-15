import { useRef, useState, useContext, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Download, Printer, Copy, Share2, Eye, Check,
  RefreshCw, Save, ChevronDown, X, Bell,
} from "lucide-react";
import { updateResume, createResume } from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

// ─────────────────────────────────────────
// Design tokens — dark blue palette
// ─────────────────────────────────────────
const C = {
  bgCard:       "#0d1e35",
  bgInput:      "#0a1628",
  border:       "rgba(96,165,250,0.12)",
  borderAccent: "rgba(59,130,246,0.32)",
  accent:       "#3b82f6",
  accentBright: "#93c5fd",
  accentDim:    "rgba(59,130,246,0.10)",
  success:      "#34d399",
  successDim:   "rgba(52,211,153,0.12)",
  successGlow:  "rgba(52,211,153,0.22)",
  danger:       "#f87171",
  dangerDim:    "rgba(248,113,113,0.09)",
  textPrimary:  "#e2eaf6",
  textSec:      "#94aed4",
  textMuted:    "#4a6080",
};

// ─────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  const colors = {
    success: { bg: "linear-gradient(135deg,#059669,#10b981)", shadow: C.successGlow },
    error:   { bg: "linear-gradient(135deg,#b91c1c,#ef4444)", shadow: "rgba(239,68,68,0.25)" },
    info:    { bg: "linear-gradient(135deg,#1d4ed8,#3b82f6)", shadow: "rgba(59,130,246,0.22)" },
  };
  const s = colors[type] || colors.info;

  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 18px", borderRadius: 12, minWidth: 260, maxWidth: 360,
      background: s.bg,
      boxShadow: `0 12px 36px ${s.shadow}, 0 0 0 1px rgba(255,255,255,0.08)`,
      animation: "toastIn 0.3s ease",
      fontFamily: "Inter, sans-serif",
    }}>
      <Bell size={15} color="#fff" />
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "#fff" }}>{message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", padding: 2 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Icon button (toolbar)
// ─────────────────────────────────────────
function IconBtn({ onClick, disabled, title, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
        background: hover ? "rgba(96,165,250,0.10)" : "rgba(96,165,250,0.04)",
        color: hover ? C.textPrimary : C.textSec,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        fontSize: 12.5, fontWeight: 500, transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────
// Action button (primary/secondary CTA)
// ─────────────────────────────────────────
function ActionBtn({ onClick, disabled, children, variant = "success" }) {
  const [hover, setHover] = useState(false);
  const styles = {
    success: {
      background: disabled ? "rgba(52,211,153,0.25)" : "linear-gradient(135deg,#059669,#10b981)",
      boxShadow: disabled ? "none" : `0 4px 14px ${C.successGlow}`,
      color: "#fff",
    },
    blue: {
      background: disabled ? C.accentDim : (hover ? "rgba(59,130,246,0.18)" : C.accentDim),
      border: `1px solid ${C.borderAccent}`,
      color: C.accentBright,
    },
    indigo: {
      background: "linear-gradient(135deg,#1d4ed8,#4338ca)",
      boxShadow: "0 4px 14px rgba(59,130,246,0.28)",
      color: "#fff",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "9px 18px", borderRadius: 9, border: "none",
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s", fontFamily: "inherit",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const ensureHttp = (url) =>
  url ? (url.startsWith("http") ? url : `https://${url}`) : "#";

const skillLevel = (level) => {
  const map = { Expert: "90%", Advanced: "75%", Intermediate: "60%", Beginner: "40%", expert: "90%", advanced: "75%", intermediate: "60%", beginner: "40%" };
  return map[level] || "55%";
};

const profDots = (proficiency) => {
  const levels = ["basic", "beginner", "intermediate", "fluent", "advanced", "native"];
  const idx = levels.indexOf((proficiency || "").toLowerCase());
  return idx >= 0 ? idx + 1 : 3;
};

// ══════════════════════════════════════════
// CLASSIC TEMPLATE  (print document — colors unchanged)
// ══════════════════════════════════════════
const ClassicTemplate = ({ resume }) => {
  const {
    personal = {}, experience = [], education = [],
    skills = [], projects = [], certifications = [], languages = [],
  } = resume;

  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#1a1a2e", padding: "40px 44px", minHeight: "297mm", background: "#fff" }}>

      {/* Header */}
      <header style={{ borderBottom: "3px solid #1d4ed8", paddingBottom: 24, marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {personal.name || "Your Name"}
        </h1>
        {personal.title && (
          <p style={{ fontSize: 17, color: "#3b82f6", fontWeight: 500, margin: "0 0 12px", fontFamily: "'Inter',sans-serif" }}>
            {personal.title}
          </p>
        )}
        {personal.summary && (
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "12px 0 16px", fontFamily: "'Inter',sans-serif" }}>
            {personal.summary}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>
          {personal.email    && <span><b style={{ color: "#64748b" }}>Email</b> <a href={`mailto:${personal.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{personal.email}</a></span>}
          {personal.phone    && <span><b style={{ color: "#64748b" }}>Phone</b> <span style={{ color: "#1e40af" }}>{personal.phone}</span></span>}
          {personal.location && <span><b style={{ color: "#64748b" }}>Location</b> <span style={{ color: "#1e40af" }}>{personal.location}</span></span>}
          {personal.linkedin && <a href={ensureHttp(personal.linkedin)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>LinkedIn</a>}
          {personal.github   && <a href={ensureHttp(personal.github)}   target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>GitHub</a>}
          {personal.portfolio && <a href={ensureHttp(personal.portfolio)} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>Portfolio</a>}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 36 }}>
        <div>
          {experience.length > 0 && (
            <Section title="Experience" accent="#1d4ed8">
              {experience.map((exp, i) => (
                <EntryCard key={i} accentColor="#2563eb">
                  <EntryHeader title={exp.jobTitle} sub={exp.company} subColor="#2563eb" location={exp.location} dates={`${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`} />
                  {exp.description && <EntryDesc>{exp.description}</EntryDesc>}
                </EntryCard>
              ))}
            </Section>
          )}
          {education.length > 0 && (
            <Section title="Education" accent="#16a34a">
              {education.map((edu, i) => (
                <EntryCard key={i} accentColor="#16a34a">
                  <EntryHeader title={edu.degree} sub={edu.institution} subColor="#16a34a" location={edu.location} dates={`${edu.startDate || ""} – ${edu.current ? "Present" : edu.endDate || ""}`} />
                  {edu.gpa && <p style={{ fontSize: 13, color: "#374151", marginTop: 4 }}><b>GPA:</b> {edu.gpa}</p>}
                </EntryCard>
              ))}
            </Section>
          )}
          {projects.length > 0 && (
            <Section title="Projects" accent="#7c3aed">
              {projects.map((proj, i) => (
                <EntryCard key={i} accentColor="#7c3aed">
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" }}>{proj.name}</p>
                  {proj.description && <EntryDesc>{proj.description}</EntryDesc>}
                  {proj.technologies?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                      {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).filter(Boolean).map((t, ti) => (
                        <span key={ti} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#ede9fe", color: "#5b21b6", fontFamily: "'Inter',sans-serif" }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {proj.link && <a href={ensureHttp(proj.link)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#7c3aed", display: "block", marginTop: 6, fontFamily: "'Inter',sans-serif" }}>View Project →</a>}
                </EntryCard>
              ))}
            </Section>
          )}
        </div>
        <div>
          {skills.length > 0 && (
            <SideSection title="Skills">
              {skills.map((skill, i) => {
                const name  = typeof skill === "string" ? skill : skill.name;
                const level = typeof skill === "object" ? skill.level : null;
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                      <span style={{ color: "#1e293b", fontWeight: 500 }}>{name}</span>
                      {level && <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "1px 7px", borderRadius: 4 }}>{level}</span>}
                    </div>
                    {level && (
                      <div style={{ height: 5, borderRadius: 3, background: "#e2e8f0" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#1d4ed8,#3b82f6)", width: skillLevel(level) }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </SideSection>
          )}
          {certifications.length > 0 && (
            <SideSection title="Certifications">
              {certifications.map((cert, i) => (
                <div key={i} style={{ borderLeft: "3px solid #d97706", paddingLeft: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0, fontFamily: "'Inter',sans-serif" }}>{cert.name}</p>
                  {cert.issuer && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0", fontFamily: "'Inter',sans-serif" }}>{cert.issuer}</p>}
                  {(cert.date || cert.issueDate) && <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontFamily: "'Inter',sans-serif" }}>{cert.date || cert.issueDate}</p>}
                </div>
              ))}
            </SideSection>
          )}
          {languages.length > 0 && (
            <SideSection title="Languages">
              {languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>
                  <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{lang.language || lang.name}</span>
                  <span style={{ fontSize: 11, color: "#3b82f6", background: "#eff6ff", padding: "2px 8px", borderRadius: 10 }}>{lang.proficiency}</span>
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// MODERN TEMPLATE  (print document — colors unchanged)
// ══════════════════════════════════════════
const ModernTemplate = ({ resume }) => {
  const {
    personal = {}, experience = [], education = [],
    skills = [], projects = [], certifications = [], languages = [],
  } = resume;

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1e293b", minHeight: "297mm", background: "#fff" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #4338ca 100%)", padding: "40px 44px", color: "#fff" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{personal.name || "Your Name"}</h1>
        {personal.title && <p style={{ fontSize: 18, opacity: 0.9, margin: "0 0 18px", fontWeight: 400 }}>{personal.title}</p>}
        {personal.summary && <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 680 }}>{personal.summary}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", fontSize: 13 }}>
          {personal.email    && <span style={{ opacity: 0.85 }}>{personal.email}</span>}
          {personal.phone    && <span style={{ opacity: 0.85 }}>{personal.phone}</span>}
          {personal.location && <span style={{ opacity: 0.85 }}>{personal.location}</span>}
          {personal.linkedin && <a href={ensureHttp(personal.linkedin)} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", textDecoration: "underline" }}>LinkedIn</a>}
          {personal.github   && <a href={ensureHttp(personal.github)}   target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", textDecoration: "underline" }}>GitHub</a>}
          {personal.portfolio && <a href={ensureHttp(personal.portfolio)} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", textDecoration: "underline" }}>Portfolio</a>}
        </div>
      </div>
      <div style={{ padding: "36px 44px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 36 }}>
          <div>
            {experience.length > 0 && (
              <ModernSection title="Experience">
                {experience.map((exp, i) => (
                  <div key={i} style={{ position: "relative", paddingLeft: 22, marginBottom: 22 }}>
                    <div style={{ position: "absolute", left: 0, top: 6, width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#6366f1)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>{exp.jobTitle}</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", margin: "2px 0" }}>{exp.company}</p>
                        {exp.location && <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{exp.location}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                        {exp.startDate || ""} – {exp.current ? "Present" : exp.endDate || ""}
                      </span>
                    </div>
                    {exp.description && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.65, marginTop: 8 }}>{exp.description}</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {education.length > 0 && (
              <ModernSection title="Education">
                {education.map((edu, i) => (
                  <div key={i} style={{ position: "relative", paddingLeft: 22, marginBottom: 18 }}>
                    <div style={{ position: "absolute", left: 0, top: 6, width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{edu.degree}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#059669", margin: "2px 0" }}>{edu.institution}</p>
                        {edu.location && <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{edu.location}</p>}
                      </div>
                      <span style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                        {edu.startDate || ""} – {edu.current ? "Present" : edu.endDate || ""}
                      </span>
                    </div>
                    {edu.gpa && <p style={{ fontSize: 13, color: "#374151", marginTop: 4 }}><b>GPA:</b> {edu.gpa}</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {projects.length > 0 && (
              <ModernSection title="Projects">
                {projects.map((proj, i) => (
                  <div key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b", margin: "0 0 5px" }}>{proj.name}</p>
                    {proj.description && <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                        {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).filter(Boolean).map((t, ti) => (
                          <span key={ti} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#ede9fe", color: "#5b21b6" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    {proj.link && <a href={ensureHttp(proj.link)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#6366f1", display: "block", marginTop: 6 }}>View Project →</a>}
                  </div>
                ))}
              </ModernSection>
            )}
          </div>
          <div>
            {skills.length > 0 && (
              <ModernSection title="Skills">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {skills.map((skill, i) => {
                    const name  = typeof skill === "string" ? skill : skill.name;
                    const level = typeof skill === "object" ? skill.level : null;
                    return (
                      <span key={i} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 7, background: "linear-gradient(135deg,#eff6ff,#eef2ff)", color: "#1d4ed8", border: "1px solid #bfdbfe", fontWeight: 500 }}>
                        {name}{level && <span style={{ opacity: 0.65, marginLeft: 4 }}>({level})</span>}
                      </span>
                    );
                  })}
                </div>
              </ModernSection>
            )}
            {certifications.length > 0 && (
              <ModernSection title="Certifications">
                {certifications.map((cert, i) => (
                  <div key={i} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{cert.name}</p>
                    {cert.issuer && <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{cert.issuer}</p>}
                    {(cert.date || cert.issueDate) && <p style={{ fontSize: 11, color: "#92400e", margin: "3px 0 0" }}>{cert.date || cert.issueDate}</p>}
                  </div>
                ))}
              </ModernSection>
            )}
            {languages.length > 0 && (
              <ModernSection title="Languages">
                {languages.map((lang, i) => {
                  const dots = profDots(lang.proficiency);
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{lang.language || lang.name}</span>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: n <= dots ? "linear-gradient(135deg,#1d4ed8,#6366f1)" : "#e2e8f0" }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ModernSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════
// MINIMAL TEMPLATE  (print document — colors unchanged)
// ══════════════════════════════════════════
const MinimalTemplate = ({ resume }) => {
  const {
    personal = {}, experience = [], education = [],
    skills = [], projects = [], certifications = [], languages = [],
  } = resume;

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: "#111827", padding: "52px 56px", minHeight: "297mm", background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <h1 style={{ fontSize: 38, fontWeight: 300, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 6px" }}>{personal.name || "Your Name"}</h1>
        {personal.title && <p style={{ fontSize: 16, color: "#64748b", margin: "0 0 16px", fontWeight: 400 }}>{personal.title}</p>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 20px", fontSize: 13, color: "#64748b" }}>
          {personal.email    && <a href={`mailto:${personal.email}`} style={{ color: "#64748b", textDecoration: "none" }}>{personal.email}</a>}
          {personal.phone    && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <a href={ensureHttp(personal.linkedin)} target="_blank" rel="noreferrer" style={{ color: "#64748b" }}>LinkedIn</a>}
          {personal.github   && <a href={ensureHttp(personal.github)}   target="_blank" rel="noreferrer" style={{ color: "#64748b" }}>GitHub</a>}
        </div>
        {personal.summary && (
          <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.75, margin: "24px auto 0", maxWidth: 620, borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "18px 0" }}>
            {personal.summary}
          </p>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 44 }}>
        <div>
          {experience.length > 0 && (
            <MinSection title="Experience">
              {experience.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", width: 110, flexShrink: 0, paddingTop: 2, lineHeight: 1.5 }}>
                    {exp.startDate || ""}<br />–<br />{exp.current ? "Present" : exp.endDate || ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 500, color: "#111827", margin: "0 0 2px" }}>{exp.jobTitle}</p>
                    <p style={{ fontSize: 13.5, color: "#374151", fontWeight: 500, margin: "0 0 3px" }}>{exp.company}</p>
                    {exp.location && <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 7px" }}>{exp.location}</p>}
                    {exp.description && <p style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.65, margin: 0 }}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </MinSection>
          )}
          {education.length > 0 && (
            <MinSection title="Education">
              {education.map((edu, i) => (
                <div key={i} style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", width: 110, flexShrink: 0, paddingTop: 2, lineHeight: 1.5 }}>
                    {edu.startDate || ""}<br />–<br />{edu.current ? "Present" : edu.endDate || ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "0 0 2px" }}>{edu.degree}</p>
                    <p style={{ fontSize: 13, color: "#374151", fontWeight: 500, margin: "0 0 3px" }}>{edu.institution}</p>
                    {edu.location && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{edu.location}</p>}
                    {edu.gpa && <p style={{ fontSize: 13, color: "#4b5563", margin: "4px 0 0" }}><b>GPA:</b> {edu.gpa}</p>}
                  </div>
                </div>
              ))}
            </MinSection>
          )}
          {projects.length > 0 && (
            <MinSection title="Projects">
              {projects.map((proj, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "0 0 4px" }}>{proj.name}</p>
                  {proj.description && <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65, margin: 0 }}>{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "5px 0 0" }}>
                      {(Array.isArray(proj.technologies) ? proj.technologies : [proj.technologies]).filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </MinSection>
          )}
        </div>
        <div>
          {skills.length > 0 && (
            <MinSection title="Skills">
              {skills.map((skill, i) => {
                const name  = typeof skill === "string" ? skill : skill.name;
                const level = typeof skill === "object" ? skill.level : null;
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span style={{ color: "#1e293b", fontWeight: 500 }}>{name}</span>
                      {level && <span style={{ fontSize: 11, color: "#94a3b8" }}>{level}</span>}
                    </div>
                    <div style={{ height: 2, background: "#f1f5f9", borderRadius: 2 }}>
                      <div style={{ height: "100%", borderRadius: 2, background: "#1e293b", width: skillLevel(level) }} />
                    </div>
                  </div>
                );
              })}
            </MinSection>
          )}
          {languages.length > 0 && (
            <MinSection title="Languages">
              {languages.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "#1e293b" }}>{lang.language || lang.name}</span>
                  <span style={{ color: "#94a3b8", textTransform: "capitalize" }}>{lang.proficiency}</span>
                </div>
              ))}
            </MinSection>
          )}
          {certifications.length > 0 && (
            <MinSection title="Certifications">
              {certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: 0 }}>{cert.name}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>{cert.issuer}</p>
                  {(cert.date || cert.issueDate) && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{cert.date || cert.issueDate}</p>}
                </div>
              ))}
            </MinSection>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Shared sub-components for templates (print colors — unchanged)
// ─────────────────────────────────────────
function Section({ title, accent = "#1d4ed8", children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: accent, borderBottom: `2px solid ${accent}22`, paddingBottom: 6, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SideSection({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 6, marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function EntryCard({ children, accentColor }) {
  return <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, marginBottom: 18 }}>{children}</div>;
}

function EntryHeader({ title, sub, subColor, location, dates }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "'Inter',sans-serif" }}>{title}</p>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: subColor, margin: "2px 0", fontFamily: "'Inter',sans-serif" }}>{sub}</p>
        {location && <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontFamily: "'Inter',sans-serif" }}>{location}</p>}
      </div>
      <span style={{ fontSize: 11.5, color: "#64748b", background: "#f8fafc", padding: "2px 9px", borderRadius: 4, border: "1px solid #e2e8f0", whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif" }}>
        {dates}
      </span>
    </div>
  );
}

function EntryDesc({ children }) {
  return <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.65, margin: "6px 0 0", fontFamily: "'Inter',sans-serif" }}>{children}</p>;
}

function ModernSection({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 8, marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

function MinSection({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 18 }}>{title}</h2>
      {children}
    </section>
  );
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════
const TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Professional & Traditional" },
  { id: "modern",  name: "Modern",  desc: "Clean & Contemporary"       },
  { id: "minimal", name: "Minimal", desc: "Simple & Elegant"           },
];

export default function ResumePreview({ resume, onResumeSaved, isEditMode = false, onClose }) {
  const previewRef   = useRef(null);
  const { token }    = useContext(AuthContext);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(resume?.template || "classic");
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Save ──────────────────────────────────
  // FIXED: Using the imported API functions instead of fetch
  const saveResume = async () => {
    if (!token) { 
      notify("Please log in to save your resume", "error"); 
      return; 
    }
    setIsSaving(true);
    
    try {
      // Create a clean payload with only the fields the backend expects
      const payload = {
        title: resume?.title || `${resume?.personal?.name || "My"}'s Resume`,
        template: activeTemplate,
        personal: {
          name: resume?.personal?.name || "",
          email: resume?.personal?.email || "",
          phone: resume?.personal?.phone || "",
          summary: resume?.personal?.summary || "",
          title: resume?.personal?.title || "",
          location: resume?.personal?.location || "",
          linkedin: resume?.personal?.linkedin || "",
          github: resume?.personal?.github || "",
          portfolio: resume?.personal?.portfolio || "",
        },
        education: (resume?.education || []).map(e => ({
          degree: e.degree || "",
          institution: e.institution || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          location: e.location || "",
          gpa: e.gpa || "",
          currentlyStudying: e.current || false,
        })),
        experience: (resume?.experience || []).map(e => ({
          role: e.jobTitle || e.role || "",
          company: e.company || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          location: e.location || "",
          description: e.description || e.desc || "",
          currentlyWorking: e.current || false,
          technologies: Array.isArray(e.technologies) ? e.technologies : [],
        })),
        projects: (resume?.projects || []).map(p => ({
          title: p.name || p.title || "",
          description: p.description || p.desc || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          startDate: p.startDate || "",
          endDate: p.endDate || "",
          currentlyWorkingOn: p.currentlyWorkingOn || false,
          githubLink: p.githubLink || p.link || "",
          liveLink: p.liveLink || "",
        })),
        // FIXED: Skills with proper enum validation matching backend expectations
        skills: (resume?.skills || []).map(s => {
          if (typeof s === "string") {
            return { 
              name: s, 
              level: "beginner", 
              category: "technical"  // Match backend enum
            };
          }
          
          // Map level to values backend accepts
          let level = "beginner";
          if (s.level) {
            const levelLower = s.level.toLowerCase();
            // Backend likely expects: beginner, intermediate, advanced, expert
            if (levelLower === "competent" || levelLower === "proficient" || levelLower === "skilled") {
              level = "intermediate";
            } else if (levelLower === "experienced" || levelLower === "master") {
              level = "expert";
            } else if (["beginner", "intermediate", "advanced", "expert"].includes(levelLower)) {
              level = levelLower;
            }
          }
          
          // Map category to values backend accepts
          let category = "technical";
          if (s.category) {
            const catLower = s.category.toLowerCase();
            if (catLower.includes("hard") || catLower === "technical") {
              category = "technical";
            } else if (catLower.includes("soft")) {
              category = "soft";
            } else if (catLower === "tool" || catLower === "tools" || catLower === "framework") {
              category = "tools";
            } else if (["technical", "soft", "tools"].includes(catLower)) {
              category = catLower;
            }
          }
          
          return { 
            name: s.name || "", 
            level: level, 
            category: category 
          };
        }).filter(s => s.name && s.name.trim() !== ""),
        certifications: (resume?.certifications || []).map(c => ({
          name: c.name || "",
          issuer: c.issuer || "",
          issueDate: c.date || c.issueDate || "",
          expiryDate: c.expiryDate || "",
          credentialId: c.credentialId || "",
          credentialUrl: c.credentialUrl || "",
        })).filter(c => c.name && c.name.trim() !== ""),
        // FIXED: Languages with proper proficiency validation
        languages: (resume?.languages || []).map(l => {
          const name = l.language || l.name || "";
          
          // Map proficiency to values backend accepts
          let proficiency = "intermediate";
          if (l.proficiency) {
            const profLower = l.proficiency.toLowerCase();
            if (["native", "fluent", "intermediate", "basic"].includes(profLower)) {
              proficiency = profLower;
            } else if (profLower === "professional" || profLower === "advanced") {
              proficiency = "fluent";
            } else if (profLower === "conversational") {
              proficiency = "intermediate";
            }
          }
          
          return {
            name: name,
            proficiency: proficiency
          };
        }).filter(l => l.name && l.name.trim() !== ""),
        isPublic: resume?.isPublic || false,
      };

      // Remove any undefined or null values
      const cleanPayload = JSON.parse(JSON.stringify(payload));
      
      // Log the payload for debugging (remove in production)
      console.log("Saving resume payload:", cleanPayload);

      // FIXED: Use the imported API functions instead of fetch
      let response;
      if (resume?._id) {
        // Update existing resume
        response = await updateResume(resume._id, cleanPayload, token);
      } else {
        // Create new resume
        response = await createResume(cleanPayload, token);
      }

      notify("Resume saved successfully!", "success");
      if (onResumeSaved) onResumeSaved(response.data);
      return response.data;
      
    } catch (err) {
      console.error("Save error:", err);
      
      // Extract error message from response if available
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Failed to save resume";
      notify(errorMessage, "error");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndClose = async () => {
    try {
      await saveResume();
      if (onClose) onClose();
      else setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
    } catch (_) {}
  };
  
  // ── PDF export ───────────────────────────
  const exportPDF = async () => {
    if (!previewRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
        logging: false, windowWidth: 794, width: 794, height: 1123,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(canvas.toDataURL("image/png", 1.0), "PNG", 0, 0,
        pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      pdf.save(`${(resume?.personal?.name || "Resume").replace(/\s+/g, "_")}_${Date.now()}.pdf`);
      notify("PDF downloaded!", "success");
    } catch (err) {
      notify("Failed to generate PDF", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Print ────────────────────────────────
  const printResume = () => {
    if (!previewRef.current) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${resume?.personal?.name || "Resume"}</title>
      <style>@media print { body { margin:0; -webkit-print-color-adjust:exact; } } @page { margin:0; }
      body { font-family: sans-serif; margin: 0; }</style></head>
      <body>${previewRef.current.innerHTML}
      <script>window.onload=()=>{setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},400)}<\/script>
      </body></html>`);
    w.document.close();
  };

  // ── Share / Copy ─────────────────────────
  const generateText = () => `
${resume?.personal?.name || "Resume"}
${resume?.personal?.title || ""}

${resume?.personal?.email    ? `Email: ${resume.personal.email}`    : ""}
${resume?.personal?.phone    ? `Phone: ${resume.personal.phone}`    : ""}
${resume?.personal?.location ? `Location: ${resume.personal.location}` : ""}

${resume?.personal?.summary ? `Summary:\n${resume.personal.summary}` : ""}

EXPERIENCE:
${(resume?.experience || []).map(e => `${e.jobTitle} @ ${e.company} (${e.startDate}–${e.current ? "Present" : e.endDate})\n${e.description || ""}`).join("\n\n") || "—"}

EDUCATION:
${(resume?.education || []).map(e => `${e.degree} – ${e.institution} (${e.startDate}–${e.current ? "Present" : e.endDate})`).join("\n") || "—"}

SKILLS:
${(resume?.skills || []).map(s => typeof s === "string" ? s : s.name).join(", ") || "—"}
  `.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateText())
      .then(() => { setCopied(true); notify("Copied to clipboard", "info"); setTimeout(() => setCopied(false), 2000); })
      .catch(() => notify("Failed to copy", "error"));
  };

  const shareResume = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${resume?.personal?.name}'s Resume`, url: window.location.href });
        notify("Shared!", "success");
      } catch { copyToClipboard(); }
    } else {
      copyToClipboard();
    }
  };

  const renderTemplate = () => {
    if (!resume) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No resume data available</div>;
    switch (activeTemplate) {
      case "modern":  return <ModernTemplate  resume={resume} />;
      case "minimal": return <MinimalTemplate resume={resume} />;
      default:        return <ClassicTemplate resume={resume} />;
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .rp-wrap * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes toastIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rp-wrap select option { background: #0a1628; color: #bfdbfe; }
      `}</style>

      <div className="rp-wrap" style={{ display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Toast ── */}
        {notification && (
          <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />
        )}

        {/* ── Toolbar ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "10px 14px", padding: "12px 16px", marginBottom: 16,
          background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14,
        }}>
          {/* Left: label + template select */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: C.accentDim, border: `1px solid ${C.borderAccent}`,
            }}>
              <Eye size={15} color={C.accentBright} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Preview</p>
              <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Updates in real-time</p>
            </div>

            {/* Template selector */}
            <div style={{ position: "relative", marginLeft: 8 }}>
              <select
                value={activeTemplate}
                onChange={e => setActiveTemplate(e.target.value)}
                style={{
                  background: C.bgInput, border: `1px solid ${C.border}`,
                  color: C.textSec, borderRadius: 8, padding: "6px 30px 6px 12px",
                  fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                  appearance: "none", WebkitAppearance: "none", outline: "none",
                  fontFamily: "inherit",
                }}
              >
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: C.textMuted, pointerEvents: "none" }} />
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <IconBtn onClick={shareResume} title="Share">
              {copied ? <Check size={14} color={C.success} /> : <Share2 size={14} />}
            </IconBtn>

            <IconBtn onClick={copyToClipboard} title="Copy plain text">
              <Copy size={14} />
            </IconBtn>

            <IconBtn onClick={printResume} title="Print">
              <Printer size={14} />
            </IconBtn>

            <ActionBtn onClick={saveResume} disabled={isSaving || !token} variant="success">
              {isSaving ? <Spinner /> : <Save size={14} />}
              {isSaving ? "Saving…" : (resume?._id ? "Update" : "Save")}
            </ActionBtn>

            {onClose && (
              <ActionBtn onClick={saveAndClose} disabled={isSaving || !token} variant="blue">
                <Check size={14} />
                Save & Close
              </ActionBtn>
            )}

            <ActionBtn onClick={exportPDF} disabled={isGenerating} variant="indigo">
              {isGenerating ? <Spinner /> : <Download size={14} />}
              {isGenerating ? "Generating…" : "Download PDF"}
            </ActionBtn>
          </div>
        </div>

        {/* ── Preview area ── */}
        <div style={{
          flex: 1, overflow: "auto", background: "#0d1829",
          borderRadius: 12, padding: "16px",
          scrollbarWidth: "thin", scrollbarColor: "rgba(96,165,250,0.15) transparent",
        }}>
          <div
            ref={previewRef}
            style={{
              width: "210mm", minHeight: "297mm", maxWidth: "100%",
              margin: "0 auto", background: "#fff",
              boxShadow: "0 4px 32px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
              borderRadius: 4,
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>
    </>
  );
}