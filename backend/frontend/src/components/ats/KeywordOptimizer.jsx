import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  TrendingUp,
  Plus,
  Check,
  X,
  Zap,
  Target,
  AlertCircle,
  Copy,
  ChevronRight,
} from 'lucide-react';

/**
 * Keyword Optimizer Component
 * Suggests industry-relevant keywords for better ATS matching
 */
export default function KeywordOptimizer({
  resume,
  darkMode = false,
  onKeywordAdd,
  onKeywordRemove,
}) {
  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [jobTitle, setJobTitle] = useState('');
  const [currentKeywords, setCurrentKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [customKeyword, setCustomKeyword] = useState('');

  // Theme classes
  const t = darkMode
    ? {
        bg: 'bg-gray-950',
        card: 'bg-gray-900 border-gray-800',
        text: 'text-gray-100',
        sub: 'text-gray-400',
        input: 'bg-gray-800 border-gray-700 text-white placeholder-gray-500',
        hover: 'hover:bg-gray-800',
        divider: 'border-gray-800',
      }
    : {
        bg: 'bg-slate-50',
        card: 'bg-white border-gray-100',
        text: 'text-gray-900',
        sub: 'text-gray-500',
        input: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
        hover: 'hover:bg-gray-50',
        divider: 'border-gray-100',
      };

  // Industry keyword database
  const industryKeywords = {
    technology: {
      technical: ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'Agile', 'REST API', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'TypeScript', 'MongoDB'],
      soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Leadership', 'Innovation', 'Critical Thinking'],
      trending: ['AI/ML', 'Cloud Native', 'DevOps', 'Microservices', 'Blockchain', 'Cybersecurity'],
    },
    finance: {
      technical: ['Financial Modeling', 'Excel', 'Bloomberg', 'SQL', 'Risk Analysis', 'Portfolio Management', 'Accounting', 'Budgeting', 'Financial Planning'],
      soft: ['Analytical Thinking', 'Attention to Detail', 'Client Relations', 'Compliance', 'Communication'],
      trending: ['Fintech', 'Cryptocurrency', 'ESG Investing', 'Quantitative Analysis', 'Algorithmic Trading'],
    },
    healthcare: {
      technical: ['EHR', 'HIPAA', 'Patient Care', 'Clinical Research', 'Medical Coding', 'Healthcare IT', 'EMR Systems'],
      soft: ['Empathy', 'Patient Advocacy', 'Team Collaboration', 'Critical Thinking', 'Communication'],
      trending: ['Telemedicine', 'Health Informatics', 'Value-Based Care', 'Population Health', 'Digital Health'],
    },
    marketing: {
      technical: ['SEO', 'SEM', 'Google Analytics', 'CRM', 'Marketing Automation', 'Content Management', 'Email Marketing', 'Social Media Marketing', 'PPC'],
      soft: ['Creative Thinking', 'Brand Strategy', 'Communication', 'Data-Driven', 'Customer Focus'],
      trending: ['Influencer Marketing', 'Video Marketing', 'Personalization', 'Marketing AI', 'Growth Hacking'],
    },
    sales: {
      technical: ['Salesforce', 'CRM', 'Pipeline Management', 'Forecasting', 'Lead Generation', 'Account Management'],
      soft: ['Negotiation', 'Relationship Building', 'Communication', 'Persuasion', 'Customer Service'],
      trending: ['Social Selling', 'Sales Enablement', 'Revenue Operations', 'Account-Based Marketing'],
    },
    design: {
      technical: ['Figma', 'Adobe Creative Suite', 'Sketch', 'Wireframing', 'Prototyping', 'UI/UX', 'Design Systems', 'User Research'],
      soft: ['Creative Problem Solving', 'User Empathy', 'Communication', 'Collaboration', 'Attention to Detail'],
      trending: ['Design Thinking', 'Accessibility', 'Motion Design', 'Design Tokens', '3D Design'],
    },
  };

  const industries = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'healthcare', label: 'Healthcare', icon: '⚕️' },
    { id: 'marketing', label: 'Marketing', icon: '📈' },
    { id: 'sales', label: 'Sales', icon: '🤝' },
    { id: 'design', label: 'Design', icon: '🎨' },
  ];

  // Extract current keywords from resume
  useEffect(() => {
    if (resume) {
      const extractedKeywords = new Set();
      
      // From skills
      if (resume.skills) {
        resume.skills.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          if (skillName) extractedKeywords.add(skillName);
        });
      }
      
      // From experience descriptions
      if (resume.experience) {
        resume.experience.forEach(exp => {
          if (exp.description) {
            // Extract technical terms (words with capital letters or specific patterns)
            const words = exp.description.split(/\s+/);
            words.forEach(word => {
              if (word.length > 2 && (/[A-Z]/.test(word) || /\//.test(word))) {
                extractedKeywords.add(word);
              }
            });
          }
        });
      }
      
      setCurrentKeywords(Array.from(extractedKeywords).slice(0, 20));
    }
  }, [resume]);

  // Update suggested keywords based on industry
  useEffect(() => {
    const keywords = industryKeywords[selectedIndustry] || industryKeywords.technology;
    const allSuggested = [
      ...keywords.technical,
      ...keywords.soft,
      ...keywords.trending,
    ];
    
    // Filter out keywords already in resume
    const filtered = allSuggested.filter(
      kw => !currentKeywords.some(current => 
        current.toLowerCase() === kw.toLowerCase()
      )
    );
    
    setSuggestedKeywords(filtered);
  }, [selectedIndustry, currentKeywords]);

  const handleAddKeyword = (keyword) => {
    if (onKeywordAdd) {
      onKeywordAdd(keyword);
    }
    setCurrentKeywords(prev => [...prev, keyword]);
  };

  const handleRemoveKeyword = (keyword) => {
    if (onKeywordRemove) {
      onKeywordRemove(keyword);
    }
    setCurrentKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleAddCustomKeyword = () => {
    if (customKeyword.trim() && !currentKeywords.includes(customKeyword.trim())) {
      handleAddKeyword(customKeyword.trim());
      setCustomKeyword('');
    }
  };

  const getKeywordCategory = (keyword) => {
    const keywords = industryKeywords[selectedIndustry] || industryKeywords.technology;
    if (keywords.trending.includes(keyword)) return 'trending';
    if (keywords.technical.includes(keyword)) return 'technical';
    if (keywords.soft.includes(keyword)) return 'soft';
    return 'custom';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'trending':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'technical':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'soft':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${t.card} border rounded-2xl p-5`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold ${t.text} mb-1 flex items-center gap-2`}>
              <Sparkles className="w-5 h-5 text-blue-500" />
              Keyword Optimizer
            </h3>
            <p className={`text-sm ${t.sub}`}>
              Add industry-relevant keywords to improve ATS matching
            </p>
          </div>
        </div>

        {/* Industry Selector */}
        <div>
          <label className={`text-xs font-semibold ${t.text} mb-2 block`}>
            Select Your Industry
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {industries.map(industry => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedIndustry === industry.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : `border-transparent ${t.card} ${t.hover}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{industry.icon}</span>
                  <span className={`text-sm font-medium ${t.text}`}>
                    {industry.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Keyword */}
        <div className="mt-4">
          <label className={`text-xs font-semibold ${t.text} mb-2 block`}>
            Add Custom Keyword
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()}
              placeholder="Enter a skill or keyword..."
              className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${t.input}`}
            />
            <button
              onClick={handleAddCustomKeyword}
              disabled={!customKeyword.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Keywords */}
      <div className={`${t.card} border rounded-2xl p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-sm font-bold ${t.text} flex items-center gap-2`}>
            <Check className="w-4 h-4 text-emerald-500" />
            Your Keywords ({currentKeywords.length})
          </h4>
          {currentKeywords.length >= 8 && currentKeywords.length <= 20 && (
            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              Optimal Range ✓
            </span>
          )}
          {currentKeywords.length < 8 && (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              Add {8 - currentKeywords.length} more
            </span>
          )}
          {currentKeywords.length > 20 && (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              Too many
            </span>
          )}
        </div>

        {currentKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentKeywords.map((keyword, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${getCategoryColor(getKeywordCategory(keyword))}`}
              >
                <span>{keyword}</span>
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:bg-white/50 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-xl`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${t.sub}`} />
            <p className={`text-sm ${t.sub}`}>No keywords yet. Add some from suggestions below.</p>
          </div>
        )}
      </div>

      {/* Suggested Keywords by Category */}
      {Object.entries(industryKeywords[selectedIndustry] || {}).map(([category, keywords]) => {
        const filteredKeywords = keywords.filter(
          kw => !currentKeywords.some(current => 
            current.toLowerCase() === kw.toLowerCase()
          )
        );

        if (filteredKeywords.length === 0) return null;

        return (
          <div key={category} className={`${t.card} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-bold ${t.text} flex items-center gap-2`}>
                {category === 'trending' && <TrendingUp className="w-4 h-4 text-purple-500" />}
                {category === 'technical' && <Zap className="w-4 h-4 text-blue-500" />}
                {category === 'soft' && <Sparkles className="w-4 h-4 text-emerald-500" />}
                {category.charAt(0).toUpperCase() + category.slice(1)} Skills
              </h4>
              <span className={`text-xs ${t.sub}`}>
                {filteredKeywords.length} suggested
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredKeywords.map((keyword, i) => (
                <button
                  key={i}
                  onClick={() => handleAddKeyword(keyword)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${getCategoryColor(category)} hover:scale-105`}
                >
                  <span>{keyword}</span>
                  <Plus className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Tips */}
      <div className={`${t.card} border rounded-2xl p-5`}>
        <h4 className={`text-sm font-bold ${t.text} mb-3 flex items-center gap-2`}>
          <AlertCircle className="w-4 h-4 text-blue-500" />
          Keyword Tips
        </h4>
        <ul className="space-y-2">
          {[
            'Use exact keywords from job descriptions when applicable',
            'Aim for 8-20 relevant keywords for optimal ATS performance',
            'Include both technical skills and soft skills',
            'Add industry-specific certifications and tools',
            'Use full names and acronyms (e.g., "Application Programming Interface (API)")',
          ].map((tip, i) => (
            <li key={i} className={`flex items-start gap-2 text-sm ${t.sub}`}>
              <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}