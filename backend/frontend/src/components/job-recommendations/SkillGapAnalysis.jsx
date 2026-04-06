import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Lightbulb,
  Rocket,
  Brain,
  Award
} from 'lucide-react';

const SkillGapAnalysis = ({ userSkills, jobSkills, gapAnalysis, darkMode }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  if (!gapAnalysis && (!userSkills || !jobSkills)) {
    return (
      <div className={`rounded-2xl p-6 border ${
        darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
      }`}>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Skill Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Add skills to your resume to see gap analysis
          </p>
        </div>
      </div>
    );
  }

  const analysis = gapAnalysis || {
    missing: jobSkills?.filter(js => 
      !userSkills?.some(us => us.toLowerCase() === js.toLowerCase())
    ) || [],
    matching: jobSkills?.filter(js => 
      userSkills?.some(us => us.toLowerCase() === js.toLowerCase())
    ) || [],
    gapPercentage: jobSkills?.length > 0 
      ? ((jobSkills.length - (analysis?.matching?.length || 0)) / jobSkills.length) * 100 
      : 0
  };

  const getSeverity = (percentage) => {
    if (percentage <= 20) return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Low Gap' };
    if (percentage <= 40) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Moderate' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'High Gap' };
  };

  const getPrioritySkills = (skills) => {
    // Prioritize based on common in-demand skills
    const priorityOrder = [
      'javascript', 'python', 'react', 'node.js', 'aws',
      'docker', 'sql', 'machine learning', 'typescript', 'devops'
    ];
    
    return [...skills].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.toLowerCase());
      const bIndex = priorityOrder.indexOf(b.toLowerCase());
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const severity = getSeverity(analysis.gapPercentage);
  const prioritizedMissing = getPrioritySkills(analysis.missing || []);
  const prioritizedMatching = getPrioritySkills(analysis.matching || []);

  const learningResources = {
    'javascript': {
      title: 'JavaScript Mastery',
      platform: 'freeCodeCamp',
      duration: '300 hours',
      link: 'https://freecodecamp.org/learn/javascript-algorithms-and-data-structures'
    },
    'react': {
      title: 'React Fundamentals',
      platform: 'Scrimba',
      duration: '40 hours',
      link: 'https://scrimba.com/learn/learnreact'
    },
    'python': {
      title: 'Python for Everybody',
      platform: 'Coursera',
      duration: '60 hours',
      link: 'https://coursera.org/specializations/python'
    },
    'aws': {
      title: 'AWS Cloud Practitioner',
      platform: 'AWS Training',
      duration: '30 hours',
      link: 'https://aws.amazon.com/training/'
    },
    'docker': {
      title: 'Docker for Developers',
      platform: 'Docker Docs',
      duration: '20 hours',
      link: 'https://docs.docker.com/get-started/'
    }
  };

  const getSkillResource = (skill) => {
    const key = Object.keys(learningResources).find(k => 
      skill.toLowerCase().includes(k)
    );
    return key ? learningResources[key] : null;
  };

  return (
    <div className={`rounded-2xl border ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Skill Gap Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Identify skills you need to learn for your target roles
              </p>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full ${severity.bg} ${severity.color} font-medium`}>
            {severity.label} • {Math.round(analysis.gapPercentage)}% Gap
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Your Skills Match</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analysis.matching?.length || 0} of {jobSkills?.length || 0} skills
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                style={{ 
                  width: `${jobSkills?.length ? (analysis.matching?.length / jobSkills.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Skills to Learn</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analysis.missing?.length || 0} skills needed
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                style={{ 
                  width: `${analysis.gapPercentage}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Comparison */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matching Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Your Strong Skills ({analysis.matching?.length || 0})
              </h4>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-sm font-medium">
                Ready to Highlight
              </div>
            </div>
            
            <div className="space-y-2">
              {prioritizedMatching.slice(0, 8).map((skill, index) => {
                const isPriority = index < 3;
                return (
                  <div
                    key={skill}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      isPriority
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPriority && <Award className="w-4 h-4 text-emerald-600" />}
                      <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                        Matched
                      </span>
                      {isPriority && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                          High Demand
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {prioritizedMatching.length > 8 && (
              <div className="text-center mt-4">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  View {prioritizedMatching.length - 8} more skills →
                </button>
              </div>
            )}
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-amber-600" />
                Skills to Learn ({analysis.missing?.length || 0})
              </h4>
              <div className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium">
                Priority Learning
              </div>
            </div>
            
            <div className="space-y-2">
              {prioritizedMissing.slice(0, 8).map((skill, index) => {
                const resource = getSkillResource(skill);
                const isPriority = index < 3;
                
                return (
                  <div
                    key={skill}
                    className={`p-3 rounded-lg ${
                      isPriority
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {isPriority && <Zap className="w-4 h-4 text-amber-600" />}
                        <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                      </div>
                      {isPriority && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                          High Priority
                        </span>
                      )}
                    </div>
                    
                    {resource && (
                      <div className="mt-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{resource.title}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">• {resource.platform}</span>
                          </div>
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-medium"
                          >
                            Start Learning →
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {resource.duration} • Free course
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {prioritizedMissing.length > 8 && (
              <div className="text-center mt-4">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                  View {prioritizedMissing.length - 8} more skills →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Plan */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-900 dark:text-white">30-Day Learning Action Plan</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white">Week 1-2</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500"></div>
                  <span>Focus on top 3 missing skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500"></div>
                  <span>Complete foundational courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500"></div>
                  <span>Build 1-2 small projects</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">2</span>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white">Week 3-4</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500"></div>
                  <span>Apply skills to portfolio projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500"></div>
                  <span>Update resume with new skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500"></div>
                  <span>Start applying to target jobs</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h5 className="font-bold text-gray-900 dark:text-white">Week 5+</h5>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500"></div>
                  <span>Continue learning advanced topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500"></div>
                  <span>Network with industry professionals</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-purple-500"></div>
                  <span>Track application progress</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Generate Detailed Learning Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;