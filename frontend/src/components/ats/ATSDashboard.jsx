import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Award,
  FileCheck,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  BarChart3,
} from 'lucide-react';

/**
 * ATS Dashboard Component
 * Displays ATS compatibility score and recommendations
 */
export default function ATSDashboard({ atsAnalysis, darkMode = false, onSectionClick }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  if (!atsAnalysis || !atsAnalysis.totalScore) {
    return (
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border rounded-2xl p-6`}>
        <div className="text-center">
          <Shield className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Build your resume to see ATS analysis
          </p>
        </div>
      </div>
    );
  }

  const { totalScore, grade, scores, suggestions, passesATS } = atsAnalysis;

  // Theme classes
  const t = darkMode
    ? {
        bg: 'bg-gray-950',
        card: 'bg-gray-900 border-gray-800',
        text: 'text-gray-100',
        sub: 'text-gray-400',
        hover: 'hover:bg-gray-800',
        divider: 'border-gray-800',
      }
    : {
        bg: 'bg-slate-50',
        card: 'bg-white border-gray-100',
        text: 'text-gray-900',
        sub: 'text-gray-500',
        hover: 'hover:bg-gray-50',
        divider: 'border-gray-100',
      };

  const getScoreColor = (score) => {
    if (score >= 85) return 'from-emerald-500 to-green-500';
    if (score >= 75) return 'from-blue-500 to-cyan-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreTextColor = (score) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const scoreCategories = [
    { key: 'contact', label: 'Contact Info', icon: Target },
    { key: 'experience', label: 'Experience', icon: Award },
    { key: 'education', label: 'Education', icon: FileCheck },
    { key: 'skills', label: 'Skills', icon: Zap },
    { key: 'keywords', label: 'Keywords', icon: Lightbulb },
    { key: 'formatting', label: 'Formatting', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <div className={`${t.card} border rounded-2xl p-6 relative overflow-hidden`}>
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(totalScore)} opacity-5`} />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={`text-lg font-bold ${t.text} mb-1`}>ATS Compatibility Score</h3>
              <p className={t.sub}>How well your resume passes Applicant Tracking Systems</p>
            </div>
            {passesATS ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                ATS-Ready
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                Needs Work
              </span>
            )}
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              {/* Circular progress */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(totalScore / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={totalScore >= 85 ? 'text-emerald-500' : totalScore >= 75 ? 'text-blue-500' : totalScore >= 60 ? 'text-amber-500' : 'text-red-500'} stopColor="currentColor" />
                    <stop offset="100%" className={totalScore >= 85 ? 'text-green-500' : totalScore >= 75 ? 'text-cyan-500' : totalScore >= 60 ? 'text-orange-500' : 'text-pink-500'} stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${getScoreTextColor(totalScore)}`}>{totalScore}</span>
                <span className={`text-xs font-semibold ${t.sub}`}>{grade}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <p className={`text-sm font-medium ${t.text} mb-1`}>Score Breakdown</p>
                  <p className={`text-xs ${t.sub}`}>
                    {totalScore >= 85 && 'Excellent! Your resume is highly optimized for ATS.'}
                    {totalScore >= 75 && totalScore < 85 && 'Good! Your resume should pass most ATS systems.'}
                    {totalScore >= 60 && totalScore < 75 && 'Fair. Some improvements needed for better ATS compatibility.'}
                    {totalScore < 60 && 'Needs improvement. Address key issues to improve ATS success.'}
                  </p>
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-2`}>
                    <p className={`text-xs ${t.sub}`}>Pass Rate</p>
                    <p className={`text-lg font-bold ${getScoreTextColor(totalScore)}`}>{totalScore >= 75 ? '85%' : totalScore >= 60 ? '65%' : '40%'}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-2`}>
                    <p className={`text-xs ${t.sub}`}>Ranking</p>
                    <p className={`text-lg font-bold ${t.text}`}>
                      {totalScore >= 85 && 'Top 10%'}
                      {totalScore >= 75 && totalScore < 85 && 'Top 25%'}
                      {totalScore >= 60 && totalScore < 75 && 'Top 50%'}
                      {totalScore < 60 && 'Below Avg'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className={`${t.card} border rounded-2xl p-5`}>
        <h4 className={`text-sm font-bold ${t.text} mb-4 flex items-center gap-2`}>
          <BarChart3 className="w-4 h-4" />
          Category Breakdown
        </h4>
        
        <div className="space-y-3">
          {scoreCategories.map(({ key, label, icon: Icon }) => {
            const categoryScore = scores[key];
            if (!categoryScore) return null;
            
            const isExpanded = expandedSection === key;
            
            return (
              <div key={key}>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className={`w-full ${t.hover} rounded-lg p-3 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: categoryScore.score >= 75 ? '#10b981' : categoryScore.score >= 50 ? '#f59e0b' : '#ef4444' }} />
                      <span className={`text-sm font-medium ${t.text}`}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getScoreTextColor(categoryScore.score)}`}>
                        {categoryScore.score}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(categoryScore.score)} transition-all duration-500`}
                      style={{ width: `${categoryScore.score}%` }}
                    />
                  </div>
                </button>
                
                {/* Expanded details */}
                {isExpanded && (
                  <div className={`mt-2 ml-6 space-y-2 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-3`}>
                    {categoryScore.strengths && categoryScore.strengths.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold ${t.text} mb-1.5 flex items-center gap-1`}>
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {categoryScore.strengths.map((strength, i) => (
                            <li key={i} className={`text-xs ${t.sub} flex items-start gap-1.5`}>
                              <span className="text-emerald-500 mt-0.5">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {categoryScore.issues && categoryScore.issues.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold ${t.text} mb-1.5 flex items-center gap-1`}>
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          Issues
                        </p>
                        <ul className="space-y-1">
                          {categoryScore.issues.map((issue, i) => (
                            <li key={i} className={`text-xs ${t.sub} flex items-start gap-1.5`}>
                              <span className="text-amber-500 mt-0.5">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className={`${t.card} border rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-sm font-bold ${t.text} flex items-center gap-2`}>
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Improvement Suggestions
            </h4>
            {suggestions.length > 3 && (
              <button
                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                className={`text-xs font-medium text-blue-500 ${t.hover} px-2 py-1 rounded`}
              >
                {showAllSuggestions ? 'Show Less' : `Show All (${suggestions.length})`}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {(showAllSuggestions ? suggestions : suggestions.slice(0, 3)).map((suggestion, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getPriorityColor(suggestion.priority)} ${t.hover} transition-colors cursor-pointer`}
                onClick={() => onSectionClick && onSectionClick(suggestion.category)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {suggestion.priority === 'high' && <AlertCircle className="w-4 h-4" />}
                  {suggestion.priority === 'medium' && <TrendingUp className="w-4 h-4" />}
                  {suggestion.priority === 'low' && <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold uppercase">{suggestion.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${suggestion.priority === 'high' ? 'bg-red-200' : suggestion.priority === 'medium' ? 'bg-amber-200' : 'bg-blue-200'}`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="text-sm">{suggestion.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}