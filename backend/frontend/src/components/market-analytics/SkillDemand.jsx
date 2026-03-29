import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  DollarSign,
  BarChart3,
  Filter,
  Search,
  AlertCircle,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';

const SkillDemand = ({ skills, userSkills, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('demand');
  const [selectedTrend, setSelectedTrend] = useState('all');

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No skill demand data available</p>
      </div>
    );
  }

  const filteredSkills = skills.filter(skill => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!skill.skill.toLowerCase().includes(searchLower)) return false;
    }

    // Trend filter
    if (selectedTrend !== 'all' && skill.trend !== selectedTrend) {
      return false;
    }

    return true;
  });

  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'demand':
        return b.demand - a.demand;
      case 'salary':
        const salaryA = a.salaryRange?.average || 0;
        const salaryB = b.salaryRange?.average || 0;
        return salaryB - salaryA;
      case 'name':
        return a.skill.localeCompare(b.skill);
      default:
        return 0;
    }
  });

  const userSkillSet = new Set(userSkills?.map(s => s.toLowerCase()));

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDemandLevel = (demand) => {
    if (demand >= 80) return { label: 'Very High', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (demand >= 60) return { label: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (demand >= 40) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (demand >= 20) return { label: 'Low', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Very Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getStats = () => {
    const userSkillCount = sortedSkills.filter(s => 
      userSkillSet.has(s.skill.toLowerCase())
    ).length;
    
    const highDemandSkills = sortedSkills.filter(s => s.demand >= 70).length;
    const risingSkills = sortedSkills.filter(s => s.trend === 'rising').length;
    
    return {
      total: sortedSkills.length,
      userSkills: userSkillCount,
      highDemand: highDemandSkills,
      rising: risingSkills,
      coverage: sortedSkills.length > 0 
        ? Math.round((userSkillCount / sortedSkills.length) * 100) 
        : 0
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skill Demand Analysis</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time demand for key skills in your industry
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
          </div>
          <div className="text-sm text-gray-500">Total Skills Tracked</div>
        </div>
        
        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {stats.userSkills}
            </div>
          </div>
          <div className="text-sm text-gray-500">Your Skills Match</div>
        </div>
        
        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {stats.highDemand}
            </div>
          </div>
          <div className="text-sm text-gray-500">High Demand Skills</div>
        </div>
        
        <div className={`p-4 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.coverage}%
            </div>
          </div>
          <div className="text-sm text-gray-500">Market Coverage</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
          >
            <option value="demand">Demand (High to Low)</option>
            <option value="salary">Salary (High to Low)</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Trend:</span>
          <div className="flex gap-1">
            {['all', 'rising', 'falling', 'stable'].map(trend => (
              <button
                key={trend}
                onClick={() => setSelectedTrend(trend)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedTrend === trend
                    ? darkMode
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Skill</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Demand</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Trend</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Avg Salary</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Your Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map((skill, index) => {
              const demandLevel = getDemandLevel(skill.demand);
              const hasSkill = userSkillSet.has(skill.skill.toLowerCase());
              
              return (
                <tr 
                  key={index} 
                  className={`border-b ${
                    darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{skill.skill}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${skill.demand}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {skill.demand}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${demandLevel.bg} ${demandLevel.color}`}>
                        {demandLevel.label}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(skill.trend)}
                      <span className="capitalize text-gray-700 dark:text-gray-300">
                        {skill.trend}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${skill.salaryRange?.average?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    {hasSkill ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">You have this skill</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Learn this skill</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    {hasSkill ? (
                      <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        Highlight in Resume →
                      </button>
                    ) : (
                      <button className="text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">
                        Start Learning →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      <div className={`p-4 rounded-xl ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Recommendations Based on Your Skills</h4>
            <div className="space-y-2">
              {stats.coverage >= 70 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    Great job! You have {stats.coverage}% coverage of in-demand skills. 
                    Focus on mastering the top 3 high-demand skills you already have.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Optimize your resume for these skills →
                  </button>
                </>
              ) : stats.coverage >= 40 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    You have {stats.coverage}% coverage. Consider learning the top {3} missing skills 
                    to increase your market value by approximately 30%.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    View learning resources →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300">
                    You have {stats.coverage}% coverage. Focus on learning the top 5 high-demand skills 
                    to significantly improve your job prospects.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    Get personalized learning plan →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDemand;