import { useState } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { DollarSign, TrendingUp, Filter } from 'lucide-react';

const SalaryDistribution = ({ data, darkMode }) => {
  const [view, setView] = useState('pie'); // 'pie' or 'bar'

  // Generate sample data if none provided
  const getSalaryData = () => {
    if (data && data.length > 0) {
      return data
        .filter(item => item.salaryRange?.average)
        .slice(0, 8)
        .map(item => ({
          name: item.skill,
          value: item.salaryRange.average,
          demand: item.demand
        }));
    }

    // Fallback data
    return [
      { name: 'JavaScript', value: 120000, demand: 85 },
      { name: 'Python', value: 125000, demand: 90 },
      { name: 'React', value: 115000, demand: 80 },
      { name: 'Node.js', value: 118000, demand: 75 },
      { name: 'AWS', value: 135000, demand: 85 },
      { name: 'Docker', value: 128000, demand: 70 },
      { name: 'Machine Learning', value: 145000, demand: 75 },
      { name: 'DevOps', value: 130000, demand: 80 }
    ];
  };

  const salaryData = getSalaryData();
  const sortedData = [...salaryData].sort((a, b) => b.value - a.value);

  const COLORS = darkMode ? [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
  ] : [
    '#2563eb', '#7c3aed', '#059669', '#d97706',
    '#dc2626', '#db2777', '#0891b2', '#65a30d'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Avg Salary:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${data.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Demand:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.demand}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Salary/Demand:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${Math.round(data.value / data.demand).toLocaleString()} per %
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  const averageSalary = salaryData.reduce((sum, item) => sum + item.value, 0) / salaryData.length;
  const maxSalary = Math.max(...salaryData.map(item => item.value));
  const minSalary = Math.min(...salaryData.map(item => item.value));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Salary by Skill
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('pie')}
            className={`p-1.5 rounded ${view === 'pie' 
              ? darkMode 
                ? 'bg-blue-900/30 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setView('bar')}
            className={`p-1.5 rounded ${view === 'bar' 
              ? darkMode 
                ? 'bg-blue-900/30 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'pie' ? (
            <RePieChart>
              <Pie
                data={salaryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salaryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </RePieChart>
          ) : (
            <BarChart data={sortedData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? '#374151' : '#e5e7eb'}
                vertical={false}
              />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                tickLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={darkMode ? '#3b82f6' : '#2563eb'}
                radius={[4, 4, 0, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`bar-cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            ${Math.round(averageSalary).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Average</div>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ${maxSalary.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Highest</div>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            ${minSalary.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Lowest</div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Insight</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {maxSalary === salaryData.find(d => d.name === 'Machine Learning')?.value
            ? "Machine Learning skills command the highest salaries in the current market."
            : "Cloud and DevOps skills offer the best salary-to-demand ratio."}
        </p>
      </div>
    </div>
  );
};

export default SalaryDistribution;