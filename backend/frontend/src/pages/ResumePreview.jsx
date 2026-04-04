import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { getResumeById } from "../services/api.js";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Edit2,
  Shield,
  Sparkles,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

// ── Format date from ISO string or plain string ───────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
      new Date(dateStr)
    );
  } catch {
    return dateStr;
  }
}

// ── Skill name helper — handles string or { name } object ─────────────────
function skillName(skill) {
  return typeof skill === "string" ? skill : skill?.name || "";
}

export default function ResumePreview() {
  const { id }        = useParams();
  const { token }     = useContext(AuthContext);
  const navigate      = useNavigate();

  const [resume,          setResume]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [activeTemplate,  setActiveTemplate]  = useState("modern");
  const [copied,          setCopied]          = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (id) fetchResume();
    else    { setError("No resume ID provided"); setLoading(false); }
  }, [id, token]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await getResumeById(id);
      // ✅ backend wraps in { success, resume } — unwrap correctly
      const data = response.data?.resume || response.data;
      setResume(data);
      if (data?.template) setActiveTemplate(data.template);
    } catch (err) {
      console.error("Error fetching resume:", err);
      setError("Failed to load resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => window.print();
  const handlePrint    = () => window.print();
  const handleEdit     = () => navigate(`/builder/${id}`);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${resume?.personal?.name || "Resume"} — CV Genix`,
        text:  "Check out my professional resume!",
        url:   window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your resume…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The resume you're looking for doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Shared section data ───────────────────────────────────────────────
  const p            = resume.personal || {};
  // ✅ summary lives in personal.summary, not resume.summary
  const summary      = p.summary || "";
  const experience   = resume.experience   || [];
  const education    = resume.education    || [];
  const skills       = resume.skills       || [];
  const certifications = resume.certifications || [];
  const projects     = resume.projects     || [];
  const languages    = resume.languages    || [];

  // ── ATS score (calculated or stored) ──────────────────────────────────
  const atsScore = resume.atsScore ?? 85;

  // ══════════════════════════════════════════════════════════════════════
  // MODERN TEMPLATE
  // ══════════════════════════════════════════════════════════════════════
  const renderModernTemplate = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-1">{p.name || "Your Name"}</h1>
            <p className="text-xl text-blue-100 mb-4">{p.title || ""}</p>

            <div className="flex flex-wrap gap-4 text-sm text-blue-100">
              {p.email    && <a href={`mailto:${p.email}`}    className="flex items-center gap-1.5 hover:text-white"><Mail    className="w-4 h-4" />{p.email}</a>}
              {p.phone    && <a href={`tel:${p.phone}`}       className="flex items-center gap-1.5 hover:text-white"><Phone   className="w-4 h-4" />{p.phone}</a>}
              {p.location && <span                            className="flex items-center gap-1.5"><MapPin  className="w-4 h-4" />{p.location || [p.city, p.country].filter(Boolean).join(", ")}</span>}
              {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white"><Linkedin className="w-4 h-4" />LinkedIn</a>}
              {p.github   && <a href={p.github}   target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white"><Github   className="w-4 h-4" />GitHub</a>}
              {p.portfolio && <a href={p.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white"><Globe   className="w-4 h-4" />Portfolio</a>}
            </div>
          </div>

          {resume.aiEnhanced && (
            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Enhanced</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-7">

        {/* Summary */}
        {summary && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Work Experience
            </h2>
            <div className="space-y-5">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l-4 border-blue-600 pl-4">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      {/* ✅ backend field is `role`, not `title` */}
                      <h3 className="font-semibold text-gray-900">{exp.role || exp.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ""}
                        {exp.employmentType ? ` · ${exp.employmentType}` : ""}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(exp.startDate)} — {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="text-gray-700 mt-2 text-sm leading-relaxed">{exp.description}</p>
                  )}

                  {exp.achievements?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" /> Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600 text-sm">
                      {edu.institution}{edu.location ? ` · ${edu.location}` : ""}
                    </p>
                    {edu.gpa && <p className="text-xs text-gray-500 mt-0.5">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {formatDate(edu.startDate)} — {edu.currentlyStudying ? "Present" : formatDate(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" /> Projects
            </h2>
            <div className="space-y-4">
              {projects.map((project, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* ✅ backend field is `title`, not `name` */}
                    <h3 className="font-semibold text-gray-900">{project.title || project.name}</h3>
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Live
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noreferrer"
                        className="text-gray-600 hover:underline text-xs flex items-center gap-1">
                        <Github className="w-3 h-3" /> Code
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                  )}
                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {skillName(skill)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-xs text-gray-400">ID: {cert.credentialId}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(cert.issueDate)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Languages
            </h2>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  {lang.proficiency && (
                    <span className="text-gray-500 ml-1">· {lang.proficiency}</span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // CLASSIC TEMPLATE
  // ══════════════════════════════════════════════════════════════════════
  const renderClassicTemplate = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
      <div className="p-8">

        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-5 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{p.name || "Your Name"}</h1>
          {p.title && <p className="text-lg text-gray-600 mb-2">{p.title}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {p.email    && <span className="flex items-center gap-1"><Mail    className="w-3.5 h-3.5" />{p.email}</span>}
            {p.phone    && <span className="flex items-center gap-1"><Phone   className="w-3.5 h-3.5" />{p.phone}</span>}
            {p.location && <span className="flex items-center gap-1"><MapPin  className="w-3.5 h-3.5" />{p.location}</span>}
            {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
            {p.github   && <a href={p.github}   target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-gray-900"><Github   className="w-3.5 h-3.5" />GitHub</a>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Profile</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Experience</h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between flex-wrap gap-1">
                  {/* ✅ `role` not `title` */}
                  <h3 className="font-semibold text-gray-900 text-sm">{exp.role || exp.title}</h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(exp.startDate)} — {exp.currentlyWorking ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                {exp.description && <p className="text-gray-700 text-sm mt-1">{exp.description}</p>}
                {exp.achievements?.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between flex-wrap gap-1 mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-gray-600 text-xs">{edu.institution}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(edu.startDate)} — {edu.currentlyStudying ? "Present" : formatDate(edu.endDate)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Projects</h2>
            {projects.map((project, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-2">
                  {/* ✅ `title` not `name` */}
                  <h3 className="font-semibold text-gray-900 text-sm">{project.title || project.name}</h3>
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline">Live ↗</a>
                  )}
                </div>
                {project.description && <p className="text-gray-700 text-xs mt-0.5">{project.description}</p>}
                {project.technologies?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{project.technologies.join(" · ")}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Skills</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {skills.map((skill, idx) => (
                <span key={idx} className="text-sm text-gray-700 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
                  {skillName(skill)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Certifications</h2>
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between flex-wrap gap-1 mb-1">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{cert.name}</p>
                  <p className="text-xs text-gray-600">{cert.issuer}</p>
                </div>
                <span className="text-xs text-gray-500">{formatDate(cert.issueDate)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang, idx) => (
                <span key={idx} className="text-sm text-gray-700">
                  {lang.name}{lang.proficiency ? ` (${lang.proficiency})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );

  // ── Page render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Template switcher */}
        <div className="mb-4 flex justify-end gap-2 print:hidden">
          {["modern", "classic"].map((tpl) => (
            <button
              key={tpl}
              onClick={() => setActiveTemplate(tpl)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTemplate === tpl
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tpl} Template
            </button>
          ))}
        </div>

        {/* Resume */}
        {activeTemplate === "modern" ? renderModernTemplate() : renderClassicTemplate()}

        {/* ATS Score strip */}
        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">ATS Compatibility Score</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-36 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    atsScore >= 85 ? "bg-emerald-500" : atsScore >= 70 ? "bg-blue-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <span className={`font-bold text-lg ${
                atsScore >= 85 ? "text-emerald-600" : atsScore >= 70 ? "text-blue-600" : "text-amber-600"
              }`}>
                {atsScore}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {atsScore >= 85
              ? "Excellent! Your resume is highly ATS-friendly."
              : atsScore >= 70
              ? "Good. A few more optimizations can improve your score."
              : "Add more relevant keywords and structure to improve ATS compatibility."}
          </p>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .shadow-lg, .shadow-sm { box-shadow: none !important; }
          .rounded-xl { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}