import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

const TrendsChart = ({ historicalData, darkMode }) => {
  const [selectedMetric, setSelectedMetric] = useState('jobPostings');

  // Generate mock data if no historical data
  const generateMockData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const baseJobs = 1000 + Math.random() * 500;
      const trend = 1 + (i / 30) * 0.2; // Increasing trend
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        jobPostings: Math.round(baseJobs * trend),
        demandScore: 50 + Math.random() * 30,
        avgSalary: 80000 + Math.random() * 40000,
        remoteJobs: Math.round(baseJobs * 0.6 * trend)
      });
    }
    
    return data;
  };

  const chartData = historicalData?.length > 0 
    ? historicalData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(item.date),
        jobPostings: item.totalJobPostings,
        demandScore: item.locationDemands?.[0]?.demandScore || 50,
        avgSalary: item.locationDemands?.[0]?.avgSalary || 100000,
        remoteJobs: Math.round(item.totalJobPostings * (item.remoteJobPercentage || 50) / 100)
      }))
    : generateMockData();

  const getMetricConfig = () => {
    switch (selectedMetric) {
      case 'jobPostings':
        return {
          dataKey: 'jobPostings',
          stroke: darkMode ? '#3b82f6' : '#2563eb',
          fill: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          label: 'Job Postings',
          formatter: (value) => value.toLocaleString()
        };
      case 'demandScore':
        return {
          dataKey: 'demandScore',
          stroke: darkMode ? '#10b981' : '#059669',
          fill: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
          label: 'Demand Score',
          formatter: (value) => `${value}%`
        };
      case 'avgSalary':
        return {
          dataKey: 'avgSalary',
          stroke: darkMode ? '#8b5cf6' : '#7c3aed',
          fill: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.1)',
          label: 'Avg Salary',
          formatter: (value) => `$${value.toLocaleString()}`
        };
      default:
        return {
          dataKey: 'jobPostings',
          stroke: '#2563eb',
          fill: 'rgba(37, 99, 235, 0.1)',
          label: 'Job Postings'
        };
    }
  };

  const metricConfig = getMetricConfig();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Job Postings:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.jobPostings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Demand Score:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.demandScore}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Avg Salary:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${data.avgSalary.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-300">Remote Jobs:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.remoteJobs.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedMetric === 'jobPostings' ? 'Job Postings Trend' :
             selectedMetric === 'demandScore' ? 'Demand Score Trend' :
             'Salary Trend'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-gray-500" />
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-sm bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
          >
            <option value="jobPostings">Job Postings</option>
            <option value="demandScore">Demand Score</option>
            <option value="avgSalary">Average Salary</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
              tickLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
              axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
            />
            <YAxis 
              tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
              tickLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
              axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
              tickFormatter={(value) => {
                if (selectedMetric === 'avgSalary') return `$${value / 1000}k`;
                if (selectedMetric === 'demandScore') return `${value}%`;
                return value >= 1000 ? `${value / 1000}k` : value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id={`color${metricConfig.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.stroke} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={metricConfig.stroke} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={metricConfig.dataKey}
              stroke={metricConfig.stroke}
              strokeWidth={2}
              fill={`url(#color${metricConfig.dataKey})`}
              dot={{ r: 3, fill: metricConfig.stroke }}
              activeDot={{ r: 6, fill: metricConfig.stroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(() => {
              const values = chartData.map(d => d[metricConfig.dataKey]);
              const latest = values[values.length - 1];
              const previous = values[values.length - 8] || values[0];
              const change = ((latest - previous) / previous) * 100;
              return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
            })()}
          </div>
          <div className="text-xs text-gray-500">30-day change</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(() => {
              const values = chartData.map(d => d[metricConfig.dataKey]);
              return metricConfig.formatter 
                ? metricConfig.formatter(values[values.length - 1])
                : values[values.length - 1];
            })()}
          </div>
          <div className="text-xs text-gray-500">Current</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(() => {
              const values = chartData.map(d => d[metricConfig.dataKey]);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              return metricConfig.formatter 
                ? metricConfig.formatter(Math.round(avg))
                : Math.round(avg);
            })()}
          </div>
          <div className="text-xs text-gray-500">30-day avg</div>
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;