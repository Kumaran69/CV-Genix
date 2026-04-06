import api from './api';

export const getSkillDemand = async (token, skill) => {
  return api.get(`/market/skills/${skill}/demand`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getSalaryTrends = async (token, location, role) => {
  return api.get('/market/salary-trends', {
    params: { location, role },
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getJobPostingsTrend = async (token) => {
  return api.get('/market/job-postings-trend', {
    headers: { Authorization: `Bearer ${token}` }
  });
};