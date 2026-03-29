import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const HeatMap = ({ data, darkMode }) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available for heatmap
      </div>
    );
  }

  // Sort by demand and take top 12
  const sortedData = [...data]
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 12);

  // Group into 3x4 grid
  const grid = [];
  for (let i = 0; i < sortedData.length; i += 4) {
    grid.push(sortedData.slice(i, i + 4));
  }

  const getDemandColor = (demand) => {
    if (demand >= 80) return darkMode ? 'bg-emerald-900' : 'bg-emerald-500';
    if (demand >= 60) return darkMode ? 'bg-green-900' : 'bg-green-400';
    if (demand >= 40) return darkMode ? 'bg-amber-900' : 'bg-amber-400';
    if (demand >= 20) return darkMode ? 'bg-orange-900' : 'bg-orange-400';
    return darkMode ? 'bg-red-900' : 'bg-red-400';
  };

  const getDemandIntensity = (demand) => {
    if (demand >= 80) return 100;
    if (demand >= 60) return 80;
    if (demand >= 40) return 60;
    if (demand >= 20) return 40;
    return 20;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-3 h-3 text-emerald-600" />;
      case 'falling':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Skill Demand Level
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-400"></div>
            <span className="text-xs text-gray-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
            <span className="text-xs text-gray-500">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 grid grid-rows-3 gap-2">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {row.map((skill, colIndex) => (
              <div
                key={skill.skill}
                className={`rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  hoveredSkill === skill.skill
                    ? darkMode
                      ? 'ring-2 ring-blue-500 scale-105'
                      : 'ring-2 ring-blue-400 scale-105'
                    : ''
                }`}
                style={{
                  backgroundColor: darkMode
                    ? `${getDemandColor(skill.demand)}${getDemandIntensity(skill.demand)}`
                    : `${getDemandColor(skill.demand)}${getDemandIntensity(skill.demand)}`
                }}
                onMouseEnter={() => setHoveredSkill(skill.skill)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {skill.skill.length > 10 
                          ? `${skill.skill.substring(0, 10)}...` 
                          : skill.skill}
                      </span>
                      {getTrendIcon(skill.trend)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {skill.demand}%
                    </span>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white/90 text-gray-700'
                    }`}>
                      Demand
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Fill empty cells */}
            {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={`rounded-lg ${
                  darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Hover Tooltip */}
      {hoveredSkill && (
        <div className={`absolute z-10 p-4 rounded-lg shadow-lg max-w-xs ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          {sortedData.find(s => s.skill === hoveredSkill) && (
            <>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {hoveredSkill}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Demand Score:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {sortedData.find(s => s.skill === hoveredSkill).demand}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Trend:</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(sortedData.find(s => s.skill === hoveredSkill).trend)}
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {sortedData.find(s => s.skill === hoveredSkill).trend}
                    </span>
                  </div>
                </div>
                {sortedData.find(s => s.skill === hoveredSkill).salaryRange?.average && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Avg Salary:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${sortedData.find(s => s.skill === hoveredSkill).salaryRange.average.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeatMap;