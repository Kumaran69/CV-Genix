import { useState } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Building,
  Sparkles,
  Target,
  Star,
  ChevronRight
} from 'lucide-react';

const JobCard = ({ job, onSave, onApply, onViewDetails, darkMode }) => {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
    if (onSave) onSave(job.jobId);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (score >= 60) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Negotiable';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'number') return `$${salary.toLocaleString()}`;
    return salary;
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const posted = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return '1m+ ago';
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50' 
        : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:border-blue-300'
    }`}>
      {/* Job Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {job.title}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {job.company}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{job.location || 'Remote'}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">{formatSalary(job.salary)}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDate(job.postedDate)}</span>
              </div>
              
              {job.remote && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                  Remote
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Match Score */}
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Match Score</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getMatchColor(job.matchScore)}`}
                    style={{ width: `${job.matchScore}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {job.matchScore}%
                </span>
              </div>
            </div>
            
            {/* Confidence Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(job.confidence)}`}>
              {job.confidence?.toUpperCase()} CONFIDENCE
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {job.requiredSkills?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Skills Required</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {job.skillGap?.matching?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Your Skills Match</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {job.missingSkills?.length || job.skillGap?.missing?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Skills to Learn</div>
          </div>
        </div>

        {/* Skills Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Skills</span>
            <span className="text-xs text-gray-500">
              {job.userSkills?.length || 0} of {job.requiredSkills?.length || 0} matched
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills?.slice(0, 5).map((skill, index) => {
              const hasSkill = job.userSkills?.some(s => 
                s.toLowerCase() === skill.toLowerCase()
              );
              
              return (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                    hasSkill
                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900/30 dark:to-green-900/30 dark:text-emerald-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
                  }`}
                >
                  {hasSkill ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {skill}
                </span>
              );
            })}
            
            {job.requiredSkills?.length > 5 && (
              <span className="px-3 py-1.5 text-sm text-gray-500">
                +{job.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Recommended Action */}
        <div className={`p-4 rounded-lg mb-4 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Recommended Action</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{job.recommendedAction}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Footer with Actions */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Building className="w-3 h-3" />
              <span>{job.source?.toUpperCase() || 'EXTERNAL'}</span>
            </div>
            {job.type && (
              <span className="text-sm text-gray-500">• {job.type}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${
                saved
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : darkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Save Job"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
              title="View Details"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onApply && onApply(job.jobId)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <span className="font-medium">Quick Apply</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded View for Missing Skills */}
      {expanded && job.missingSkills?.length > 0 && (
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Skills to Learn</h4>
            <div className="grid grid-cols-2 gap-2">
              {job.missingSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {skill}
                  </span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Find Courses
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Improve your match score by learning these skills</span>
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
              View Learning Path →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;