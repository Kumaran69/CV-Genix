import { useState, useRef } from "react";
import VoiceInput from "./VoiceInput";
import {
  User, Briefcase, GraduationCap, Code, Award, Globe,
  Plus, Trash2, Mail, Phone, MapPin, Link, ExternalLink,
  FileText, Building, ChevronDown, CheckCircle, Sparkles, Tag,
} from "lucide-react";

// ─────────────────────────────────────────────
// Design tokens — Cosmic Dark Theme
// ─────────────────────────────────────────────
const INPUT =
  "w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-400/60";

const INPUT_BG =
  "bg-[#0d0d1a] border border-white/10 hover:border-violet-400/40 focus:border-violet-400/70";

const LABEL =
  "block text-xs font-bold uppercase tracking-[0.15em] text-white mb-2";

const CARD    = "rounded-2xl border overflow-hidden transition-all duration-300";
const CARD_BG = "bg-white/[0.04] border-white/10 backdrop-blur-sm";

const ADD_BTN =
  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95";

const SECTION_NAV_ACTIVE =
  "text-white border border-violet-400/60 shadow-lg shadow-violet-500/20";

const SECTION_NAV_INACTIVE =
  "text-slate-400 border border-white/8 hover:text-white hover:border-white/20 hover:bg-white/5";

// ─────────────────────────────────────────────
// Reusable field components
// ─────────────────────────────────────────────
function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/70 pointer-events-none" />
        )}
        <div className={Icon ? "pl-10" : ""}>{children}</div>
      </div>
      {hint && <p className="text-xs text-slate-500 mt-1.5 pl-1">{hint}</p>}
    </div>
  );
}

function TextInput({ icon, value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/70 pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${INPUT} ${INPUT_BG} ${icon ? "pl-10" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

function SelectInput({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${INPUT} ${INPUT_BG} appearance-none pr-9 cursor-pointer`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/70 pointer-events-none" />
    </div>
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 4, extra }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`${INPUT} ${INPUT_BG} resize-none leading-relaxed`}
      />
      {extra && <div className="absolute bottom-3 right-3">{extra}</div>}
    </div>
  );
}

function CheckRow({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked
          ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 border-transparent shadow-md shadow-violet-500/40"
          : "border-white/20 bg-white/5 group-hover:border-violet-400/50"
      }`}>
        {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

function ItemCard({ title, badge, onRemove, children }) {
  return (
    <div className={`${CARD} ${CARD_BG}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-400/25 tracking-wider">
            {badge}
          </span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function SectionHeading({ title, onAdd, addLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className={`${ADD_BTN} text-violet-300 bg-violet-500/10 border border-violet-400/30 hover:bg-violet-500/20 hover:text-white hover:border-violet-400/60 hover:shadow-md hover:shadow-violet-500/20`}
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message, cta, onCta }) {
  return (
    <div className="rounded-2xl py-12 text-center border border-dashed border-white/10 bg-white/[0.02]">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/20">
        <Icon className="w-5 h-5 text-violet-400/70" />
      </div>
      <p className="text-sm text-slate-400 mb-3">{message}</p>
      {cta && (
        <button onClick={onCta} className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          {cta} →
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const SECTIONS = [
  { id: "personal",       name: "Personal",       short: "Info",   icon: User,          gradient: "from-cyan-400 to-blue-500"     },
  { id: "experience",     name: "Experience",     short: "Exp",    icon: Briefcase,     gradient: "from-violet-400 to-purple-500" },
  { id: "education",      name: "Education",      short: "Edu",    icon: GraduationCap, gradient: "from-emerald-400 to-teal-500"  },
  { id: "skills",         name: "Skills",         short: "Skills", icon: Code,          gradient: "from-amber-400 to-orange-500"  },
  { id: "projects",       name: "Projects",       short: "Proj",   icon: FileText,      gradient: "from-pink-400 to-rose-500"     },
  { id: "certifications", name: "Certifications", short: "Certs",  icon: Award,         gradient: "from-yellow-400 to-amber-500"  },
  { id: "languages",      name: "Languages",      short: "Lang",   icon: Globe,         gradient: "from-sky-400 to-indigo-500"    },
];

// Updated to match the valid enum values from your validation function
const SKILL_LEVELS = ["beginner", "competent", "proficient", "skilled", "experienced", "master"];

// Updated to match the valid enum values from your validation function
const SKILL_CATEGORIES = [
  { value: "hard skills", label: "Hard Skills",  color: "#818cf8" },
  { value: "soft skills", label: "Soft Skills", color: "#f472b6" },
  { value: "personal",    label: "Personal",    color: "#34d399" },
  { value: "language",    label: "Language",    color: "#fbbf24" },
  { value: "tool",        label: "Tool",        color: "#a78bfa" },
  { value: "framework",   label: "Framework",   color: "#ec4899" },
];

// No changes needed here
const PROFICIENCY_LEVELS = ["native", "fluent", "intermediate", "basic"];
const PROFICIENCY_COLORS = {
  native: "#34d399", fluent: "#818cf8", intermediate: "#fbbf24", basic: "#64748b",
};

// Updated to match the new SKILL_LEVELS
const LEVEL_COLORS = {
  beginner: "#64748b", 
  competent: "#818cf8", 
  proficient: "#fbbf24", 
  skilled: "#34d399",
  experienced: "#a78bfa",
  master: "#ec4899",
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ResumeForm({ resumeData, setResumeData }) {
  const [activeSection, setActiveSection] = useState("personal");
  const [newSkill, setNewSkill] = useState({ name: "", category: "technical", level: "intermediate" });
  const skillInputRef = useRef(null);

  const handlePersonalChange = (field, value) =>
    setResumeData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));

  const handleArrayItemChange = (section, index, field, value) =>
    setResumeData((prev) => {
      const arr = [...(prev[section] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });

  const addArrayItem = (section, item) =>
    setResumeData((prev) => ({ ...prev, [section]: [...(prev[section] || []), item] }));

  const removeArrayItem = (section, index) =>
    setResumeData((prev) => {
      const arr = [...(prev[section] || [])];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    addArrayItem("skills", { ...newSkill, name: newSkill.name.trim() });
    setNewSkill((s) => ({ ...s, name: "" }));
    skillInputRef.current?.focus();
  };

  const sectionCount = (id) => {
    if (id === "personal") return null;
    const len = resumeData[id]?.length;
    return len > 0 ? len : null;
  };

  const activeGradient = SECTIONS.find((s) => s.id === activeSection)?.gradient || "from-violet-400 to-fuchsia-500";

  // ─────────────────────────────────────────────
  // PERSONAL
  // ─────────────────────────────────────────────
  const renderPersonal = () => (
    <div className="space-y-5 animate-form-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *">
          <TextInput icon={<User className="w-4 h-4" />} value={resumeData.personal?.name || ""} onChange={(e) => handlePersonalChange("name", e.target.value)} placeholder="Jane Doe" />
        </Field>
        <Field label="Professional Title">
          <TextInput value={resumeData.personal?.title || ""} onChange={(e) => handlePersonalChange("title", e.target.value)} placeholder="Senior Software Engineer" />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email *">
          <TextInput icon={<Mail className="w-4 h-4" />} type="email" value={resumeData.personal?.email || ""} onChange={(e) => handlePersonalChange("email", e.target.value)} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone *">
          <TextInput icon={<Phone className="w-4 h-4" />} type="tel" value={resumeData.personal?.phone || ""} onChange={(e) => handlePersonalChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
        </Field>
      </div>
      <Field label="Location" hint="e.g. San Francisco, CA">
        <TextInput icon={<MapPin className="w-4 h-4" />} value={resumeData.personal?.location || ""} onChange={(e) => handlePersonalChange("location", e.target.value)} placeholder="San Francisco, CA" />
      </Field>
      <Field label="Professional Summary">
        <TextareaInput
          value={resumeData.personal?.summary || ""}
          onChange={(e) => handlePersonalChange("summary", e.target.value)}
          placeholder="Passionate engineer with 5+ years building scalable products…"
          rows={4}
          extra={<VoiceInput onText={(text) => handlePersonalChange("summary", text)} className="bg-violet-500 hover:bg-violet-400" />}
        />
        <p className="text-xs text-white-500 mt-1.5 pl-1">Recruiters read this first — make it compelling.</p>
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="LinkedIn">
          <TextInput icon={<Link className="w-4 h-4" />} value={resumeData.personal?.linkedin || ""} onChange={(e) => handlePersonalChange("linkedin", e.target.value)} placeholder="linkedin.com/in/username" />
        </Field>
        <Field label="GitHub">
          <TextInput icon={<ExternalLink className="w-4 h-4" />} value={resumeData.personal?.github || ""} onChange={(e) => handlePersonalChange("github", e.target.value)} placeholder="github.com/username" />
        </Field>
      </div>
      <Field label="Portfolio / Website">
        <TextInput icon={<Globe className="w-4 h-4" />} value={resumeData.personal?.portfolio || ""} onChange={(e) => handlePersonalChange("portfolio", e.target.value)} placeholder="https://yoursite.com" />
      </Field>
    </div>
  );

  // ─────────────────────────────────────────────
  // EXPERIENCE
  // ─────────────────────────────────────────────
  const newExp = () => ({ jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });

  const renderExperience = () => (
    <div className="space-y-4 animate-form-in">
      <SectionHeading title="Work Experience" addLabel="Add Role" onAdd={() => addArrayItem("experience", newExp())} />
      {!resumeData.experience?.length && <EmptyState icon={Briefcase} message="No experience entries yet" cta="Add your first role" onCta={() => addArrayItem("experience", newExp())} />}
      {resumeData.experience?.map((exp, i) => (
        <ItemCard key={i} badge={`0${i + 1}`} title={exp.jobTitle || exp.company || "Untitled Role"} onRemove={() => removeArrayItem("experience", i)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Job Title *">
              <TextInput value={exp.jobTitle || ""} onChange={(e) => handleArrayItemChange("experience", i, "jobTitle", e.target.value)} placeholder="Senior Software Engineer" />
            </Field>
            <Field label="Company *">
              <TextInput icon={<Building className="w-4 h-4" />} value={exp.company || ""} onChange={(e) => handleArrayItemChange("experience", i, "company", e.target.value)} placeholder="Google Inc." />
            </Field>
          </div>
          <Field label="Location">
            <TextInput icon={<MapPin className="w-4 h-4" />} value={exp.location || ""} onChange={(e) => handleArrayItemChange("experience", i, "location", e.target.value)} placeholder="Remote · New York, NY" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input type="month" value={exp.startDate || ""} onChange={(e) => handleArrayItemChange("experience", i, "startDate", e.target.value)} className={`${INPUT} ${INPUT_BG}`} />
            </Field>
            <Field label="End Date">
              <input type="month" value={exp.endDate || ""} disabled={exp.current} onChange={(e) => handleArrayItemChange("experience", i, "endDate", e.target.value)} className={`${INPUT} ${INPUT_BG} ${exp.current ? "opacity-30 cursor-not-allowed" : ""}`} />
            </Field>
          </div>
          <CheckRow id={`exp-current-${i}`} checked={exp.current || false} onChange={(e) => handleArrayItemChange("experience", i, "current", e.target.checked)} label="I currently work here" />
          <Field label="Description">
            <TextareaInput value={exp.description || ""} onChange={(e) => handleArrayItemChange("experience", i, "description", e.target.value)} placeholder="• Led a team of 5 engineers to redesign the core API, reducing latency by 40%" rows={4} />
            <p className="text-xs text-slate-500 mt-1.5 pl-1">Use bullet points. Quantify impact wherever possible.</p>
          </Field>
        </ItemCard>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // EDUCATION
  // ─────────────────────────────────────────────
  const newEdu = () => ({ degree: "", institution: "", location: "", startDate: "", endDate: "", gpa: "", current: false });

  const renderEducation = () => (
    <div className="space-y-4 animate-form-in">
      <SectionHeading title="Education" addLabel="Add Entry" onAdd={() => addArrayItem("education", newEdu())} />
      {!resumeData.education?.length && <EmptyState icon={GraduationCap} message="No education entries yet" cta="Add your degree" onCta={() => addArrayItem("education", newEdu())} />}
      {resumeData.education?.map((edu, i) => (
        <ItemCard key={i} badge={`0${i + 1}`} title={edu.degree || edu.institution || "Untitled Degree"} onRemove={() => removeArrayItem("education", i)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Degree *">
              <TextInput value={edu.degree || ""} onChange={(e) => handleArrayItemChange("education", i, "degree", e.target.value)} placeholder="B.Sc. Computer Science" />
            </Field>
            <Field label="Institution *">
              <TextInput value={edu.institution || ""} onChange={(e) => handleArrayItemChange("education", i, "institution", e.target.value)} placeholder="Stanford University" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Location">
              <TextInput icon={<MapPin className="w-4 h-4" />} value={edu.location || ""} onChange={(e) => handleArrayItemChange("education", i, "location", e.target.value)} placeholder="Stanford, CA" />
            </Field>
            <Field label="GPA">
              <TextInput value={edu.gpa || ""} onChange={(e) => handleArrayItemChange("education", i, "gpa", e.target.value)} placeholder="3.9 / 4.0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input type="month" value={edu.startDate || ""} onChange={(e) => handleArrayItemChange("education", i, "startDate", e.target.value)} className={`${INPUT} ${INPUT_BG}`} />
            </Field>
            <Field label="End Date">
              <input type="month" value={edu.endDate || ""} disabled={edu.current} onChange={(e) => handleArrayItemChange("education", i, "endDate", e.target.value)} className={`${INPUT} ${INPUT_BG} ${edu.current ? "opacity-30 cursor-not-allowed" : ""}`} />
            </Field>
          </div>
          <CheckRow id={`edu-current-${i}`} checked={edu.current || false} onChange={(e) => handleArrayItemChange("education", i, "current", e.target.checked)} label="I currently study here" />
        </ItemCard>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // SKILLS
  // ─────────────────────────────────────────────
  const renderSkills = () => {
    const byCategory = (cat) =>
      (resumeData.skills || []).map((s, idx) => ({ ...s, _idx: idx })).filter((s) => s.category === cat);

    return (
      <div className="space-y-5 animate-form-in">
        <SectionHeading title="Skills" />
        <div className="rounded-2xl p-5 bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-amber-300">Add Skill</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={LABEL}>Skill Name</label>
              <input
                ref={skillInputRef}
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill((s) => ({ ...s, name: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                placeholder="React, Leadership…"
                className={`${INPUT} ${INPUT_BG}`}
              />
            </div>
            <div>
              <label className={LABEL}>Category</label>
              <SelectInput value={newSkill.category} onChange={(e) => setNewSkill((s) => ({ ...s, category: e.target.value }))}>
                {SKILL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </SelectInput>
            </div>
            <div>
              <label className={LABEL}>Level</label>
              <SelectInput value={newSkill.level} onChange={(e) => setNewSkill((s) => ({ ...s, level: e.target.value }))}>
                {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </SelectInput>
            </div>
          </div>
          <button
            onClick={handleAddSkill}
            disabled={!newSkill.name.trim()}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
              newSkill.name.trim() ? "text-white shadow-lg shadow-violet-500/30" : "opacity-30 cursor-not-allowed text-slate-400"
            }`}
            style={newSkill.name.trim()
              ? { background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Plus className="w-4 h-4" />
            Add Skill {newSkill.name.trim() && `"${newSkill.name}"`}
          </button>
          <p className="text-xs text-slate-600 mt-2 text-center">Press Enter to quickly add</p>
        </div>

        {resumeData.skills?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SKILL_CATEGORIES.map((cat) => {
              const catSkills = byCategory(cat.value);
              return (
                <div key={cat.value} className="rounded-2xl p-4 bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3.5 h-3.5" style={{ color: cat.color }} />
                    <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: cat.color }}>{cat.label}</span>
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-lg" style={{ background: `${cat.color}18`, color: cat.color }}>{catSkills.length}</span>
                  </div>
                  {catSkills.length === 0 && <p className="text-xs text-slate-600 text-center py-3">None yet</p>}
                  <div className="space-y-2">
                    {catSkills.map((skill) => (
                      <div key={skill._idx} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl group bg-white/[0.04] border border-white/8 hover:border-white/15 transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LEVEL_COLORS[skill.level] || "#64748b", boxShadow: `0 0 6px ${LEVEL_COLORS[skill.level] || "#64748b"}60` }} />
                          <span className="text-sm text-white truncate">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-slate-500 hidden group-hover:block">{skill.level}</span>
                          <button onClick={() => removeArrayItem("skills", skill._idx)} className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!resumeData.skills?.length && <EmptyState icon={Code} message="Add skills to show recruiters what you know" />}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // PROJECTS
  // ─────────────────────────────────────────────
  const newProj = () => ({ name: "", description: "", technologies: [], link: "" });

  const renderProjects = () => (
    <div className="space-y-4 animate-form-in">
      <SectionHeading title="Projects" addLabel="Add Project" onAdd={() => addArrayItem("projects", newProj())} />
      {!resumeData.projects?.length && <EmptyState icon={FileText} message="Showcase your best work" cta="Add a project" onCta={() => addArrayItem("projects", newProj())} />}
      {resumeData.projects?.map((proj, i) => (
        <ItemCard key={i} badge={`0${i + 1}`} title={proj.name || "Untitled Project"} onRemove={() => removeArrayItem("projects", i)}>
          <Field label="Project Name *">
            <TextInput value={proj.name || ""} onChange={(e) => handleArrayItemChange("projects", i, "name", e.target.value)} placeholder="E-Commerce Platform" />
          </Field>
          <Field label="Description" hint="Explain the purpose, your role, and the impact.">
            <TextareaInput value={proj.description || ""} onChange={(e) => handleArrayItemChange("projects", i, "description", e.target.value)} placeholder="Built a full-stack app that reduced checkout time by 60%…" rows={3} />
          </Field>
          <Field label="Technologies" hint="Comma-separated — e.g. React, Node.js, PostgreSQL">
            <TextInput
              icon={<Code className="w-4 h-4" />}
              value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""}
              onChange={(e) => handleArrayItemChange("projects", i, "technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              placeholder="React, Node.js, MongoDB"
            />
            {proj.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {proj.technologies.map((t, ti) => t ? (
                  <span key={ti} className="px-2.5 py-0.5 rounded-lg text-xs font-medium text-violet-200 bg-violet-500/15 border border-violet-400/20">{t}</span>
                ) : null)}
              </div>
            )}
          </Field>
          <Field label="Project Link">
            <TextInput icon={<ExternalLink className="w-4 h-4" />} value={proj.link || ""} onChange={(e) => handleArrayItemChange("projects", i, "link", e.target.value)} placeholder="https://github.com/you/project" />
          </Field>
        </ItemCard>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // CERTIFICATIONS
  // ─────────────────────────────────────────────
  const newCert = () => ({ name: "", issuer: "", date: "", credentialId: "", url: "" });

  const renderCertifications = () => (
    <div className="space-y-4 animate-form-in">
      <SectionHeading title="Certifications" addLabel="Add Cert" onAdd={() => addArrayItem("certifications", newCert())} />
      {!resumeData.certifications?.length && <EmptyState icon={Award} message="Certifications can set you apart" cta="Add your first certification" onCta={() => addArrayItem("certifications", newCert())} />}
      {resumeData.certifications?.map((cert, i) => (
        <ItemCard key={i} badge={`0${i + 1}`} title={cert.name || "Untitled Certification"} onRemove={() => removeArrayItem("certifications", i)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Certification Name *">
              <TextInput value={cert.name || ""} onChange={(e) => handleArrayItemChange("certifications", i, "name", e.target.value)} placeholder="AWS Certified Solutions Architect" />
            </Field>
            <Field label="Issuing Organization *">
              <TextInput icon={<Building className="w-4 h-4" />} value={cert.issuer || ""} onChange={(e) => handleArrayItemChange("certifications", i, "issuer", e.target.value)} placeholder="Amazon Web Services" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Issue Date">
              <input type="month" value={cert.date || ""} onChange={(e) => handleArrayItemChange("certifications", i, "date", e.target.value)} className={`${INPUT} ${INPUT_BG}`} />
            </Field>
            <Field label="Credential ID">
              <TextInput value={cert.credentialId || ""} onChange={(e) => handleArrayItemChange("certifications", i, "credentialId", e.target.value)} placeholder="AWS-SAA-12345" />
            </Field>
          </div>
          <Field label="Credential URL">
            <TextInput icon={<ExternalLink className="w-4 h-4" />} value={cert.url || ""} onChange={(e) => handleArrayItemChange("certifications", i, "url", e.target.value)} placeholder="https://verify.credential.com/…" />
          </Field>
        </ItemCard>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // LANGUAGES
  // ─────────────────────────────────────────────
  const renderLanguages = () => (
    <div className="space-y-4 animate-form-in">
      <SectionHeading title="Languages" addLabel="Add Language" onAdd={() => addArrayItem("languages", { language: "", proficiency: "intermediate" })} />
      {!resumeData.languages?.length && <EmptyState icon={Globe} message="Multilingual skills are a huge plus" cta="Add a language" onCta={() => addArrayItem("languages", { language: "", proficiency: "intermediate" })} />}
      <div className="space-y-3">
        {resumeData.languages?.map((lang, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/15 transition-all">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PROFICIENCY_COLORS[lang.proficiency] || "#64748b", boxShadow: `0 0 8px ${PROFICIENCY_COLORS[lang.proficiency] || "#64748b"}60` }} />
            <div className="flex-1">
              <input
                type="text"
                value={lang.language || ""}
                onChange={(e) => handleArrayItemChange("languages", i, "language", e.target.value)}
                placeholder="English, Spanish, Mandarin…"
                className={`${INPUT} ${INPUT_BG} py-2.5`}
              />
            </div>
            <div className="w-40 flex-shrink-0">
              <SelectInput value={lang.proficiency || "intermediate"} onChange={(e) => handleArrayItemChange("languages", i, "proficiency", e.target.value)}>
                {PROFICIENCY_LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </SelectInput>
            </div>
            <button onClick={() => removeArrayItem("languages", i)} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "personal":       return renderPersonal();
      case "experience":     return renderExperience();
      case "education":      return renderEducation();
      case "skills":         return renderSkills();
      case "projects":       return renderProjects();
      case "certifications": return renderCertifications();
      case "languages":      return renderLanguages();
      default:               return renderPersonal();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes formIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-form-in { animation: formIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }

        input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(4) hue-rotate(230deg);
          cursor: pointer;
        }
        select { -webkit-appearance: none; -moz-appearance: none; }

        input::placeholder, textarea::placeholder {
          color: rgba(148, 163, 184, 0.35);
        }
        input[type="month"] { color-scheme: dark; }
        select option { background: #0d0d1a; color: #e2e8f0; }
      `}</style>

      <div className="flex flex-col h-full gap-0" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* ── Section Navigation ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-4 flex-shrink-0 border-b border-white/8">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const count    = sectionCount(sec.id);
            const Icon     = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all duration-200 active:scale-95 flex-shrink-0 ${
                  isActive ? SECTION_NAV_ACTIVE : SECTION_NAV_INACTIVE
                }`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.12))",
                } : {}}
              >
                <span className={`flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0 transition-all ${isActive ? `bg-gradient-to-br ${sec.gradient}` : "bg-white/8"}`}>
                  <Icon className="w-3 h-3 text-white" />
                </span>
                <span className="hidden sm:block">{sec.name}</span>
                <span className="sm:hidden">{sec.short}</span>
                {count !== null && (
                  <span
                    className="text-xs font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={isActive
                      ? { background: "rgba(167,139,250,0.30)", color: "#c4b5fd" }
                      : { background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Active section color strip ── */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className={`h-px w-6 rounded-full bg-gradient-to-r ${activeGradient}`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r ${activeGradient} bg-clip-text text-transparent`}>
            {SECTIONS.find((s) => s.id === activeSection)?.name}
          </span>
          <div className={`h-px flex-1 rounded-full bg-gradient-to-r ${activeGradient} opacity-15`} />
        </div>

        {/* ── Content ── */}
        <div
          className="flex-1 overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.2) transparent" }}
        >
          {renderContent()}
          <div className="h-6" />
        </div>
      </div>
    </>
  );
}