const axios = require('axios');

class ExternalApis {
  constructor() {
    this.linkedInApiKey = process.env.LINKEDIN_API_KEY;
    this.indeedApiKey = process.env.INDEED_API_KEY;
    this.glassdoorApiKey = process.env.GLASSDOOR_API_KEY;
    this.githubJobsUrl = 'https://jobs.github.com/positions.json';
  }

  async fetchLinkedInJobs(query, location = 'remote', limit = 50) {
    try {
      // LinkedIn Jobs API integration
      const response = await axios.get('https://api.linkedin.com/v2/jobs', {
        params: {
          keyword: query,
          location: location,
          count: limit,
          sort: 'R'
        },
        headers: {
          'Authorization': `Bearer ${this.linkedInApiKey}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      return this.formatLinkedInJobs(response.data);
    } catch (error) {
      console.error('LinkedIn API Error:', error.message);
      return [];
    }
  }

  async fetchIndeedJobs(query, location = 'remote', limit = 50) {
    try {
      // Indeed API integration
      const response = await axios.get('https://api.indeed.com/ads/apisearch', {
        params: {
          publisher: this.indeedApiKey,
          q: query,
          l: location,
          format: 'json',
          v: '2',
          limit: limit,
          sort: 'date',
          fromage: '30'
        }
      });
      return this.formatIndeedJobs(response.data);
    } catch (error) {
      console.error('Indeed API Error:', error.message);
      return [];
    }
  }

  async fetchGlassdoorJobs(query, location = 'remote', limit = 50) {
    try {
      // Glassdoor API integration
      const response = await axios.get('https://api.glassdoor.com/api/api.htm', {
        params: {
          't.p': process.env.GLASSDOOR_PARTNER_ID,
          't.k': process.env.GLASSDOOR_KEY,
          userip: '0.0.0.0',
          useragent: 'Mozilla/5.0',
          format: 'json',
          v: '1',
          action: 'jobs-prog',
          countryId: '1',
          jobType: 'fulltime',
          keyword: query,
          city: location
        }
      });
      return this.formatGlassdoorJobs(response.data);
    } catch (error) {
      console.error('Glassdoor API Error:', error.message);
      return [];
    }
  }

  async fetchGithubJobs(query, location = 'remote', limit = 50) {
    try {
      // GitHub Jobs API
      const response = await axios.get(this.githubJobsUrl, {
        params: {
          description: query,
          location: location,
          full_time: 'true'
        }
      });
      return this.formatGithubJobs(response.data.slice(0, limit));
    } catch (error) {
      console.error('GitHub Jobs API Error:', error.message);
      return [];
    }
  }

  async fetchAllJobs(query, location = 'remote', limit = 20) {
    try {
      const [
        linkedinJobs,
        indeedJobs,
        glassdoorJobs,
        githubJobs
      ] = await Promise.allSettled([
        this.fetchLinkedInJobs(query, location, limit),
        this.fetchIndeedJobs(query, location, limit),
        this.fetchGlassdoorJobs(query, location, limit),
        this.fetchGithubJobs(query, location, limit)
      ]);

      // Combine all jobs and remove duplicates
      const allJobs = [
        ...(linkedinJobs.value || []),
        ...(indeedJobs.value || []),
        ...(glassdoorJobs.value || []),
        ...(githubJobs.value || [])
      ];

      return this.removeDuplicateJobs(allJobs);
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }
  }

  formatLinkedInJobs(jobs) {
    return jobs.elements?.map(job => ({
      source: 'linkedin',
      jobId: job.id,
      title: job.title,
      company: job.companyDetails?.name || 'Unknown Company',
      location: job.location?.name || 'Remote',
      description: job.description?.text || '',
      skills: job.skills || [],
      salary: job.salary || null,
      applyUrl: job.applyUrl || job.url,
      postedDate: new Date(job.postedDate || Date.now()),
      remote: job.remote || false,
      type: job.jobType || 'Full-time'
    })) || [];
  }

  formatIndeedJobs(jobs) {
    return jobs.results?.map(job => ({
      source: 'indeed',
      jobId: job.jobkey,
      title: job.jobtitle,
      company: job.company,
      location: job.formattedLocationFull,
      description: job.snippet,
      skills: [],
      salary: job.salary || null,
      applyUrl: job.url,
      postedDate: new Date(job.date),
      remote: job.remote || false,
      type: 'Full-time'
    })) || [];
  }

  formatGlassdoorJobs(jobs) {
    return jobs.response?.jobs?.map(job => ({
      source: 'glassdoor',
      jobId: job.jobId,
      title: job.jobTitle,
      company: job.employerName,
      location: job.location,
      description: job.jobDescription,
      skills: [],
      salary: job.salary || null,
      applyUrl: job.jobUrl,
      postedDate: new Date(job.postedDate),
      remote: job.remote || false,
      type: job.jobType || 'Full-time'
    })) || [];
  }

  formatGithubJobs(jobs) {
    return jobs.map(job => ({
      source: 'github',
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      skills: [],
      salary: null,
      applyUrl: job.url,
      postedDate: new Date(job.created_at),
      remote: job.location?.toLowerCase().includes('remote') || false,
      type: job.type || 'Full-time'
    }));
  }

  removeDuplicateJobs(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}-${job.location}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = new ExternalApis();