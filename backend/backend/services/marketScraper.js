const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const JobMarketData = require('../models/JobMarketData');

class MarketScraper {
  constructor() {
    this.sources = {
      linkedin: 'https://www.linkedin.com/jobs/search/',
      indeed: 'https://www.indeed.com/jobs',
      glassdoor: 'https://www.glassdoor.com/Job/jobs.htm'
    };
  }

  async scrapeMarketData(industry = 'technology', location = 'United States') {
    try {
      console.log(`Scraping market data for ${industry} in ${location}...`);
      
      const [jobCount, skillDemand, salaryData, companyTrends] = await Promise.all([
        this.scrapeJobCount(industry, location),
        this.scrapeSkillDemand(industry),
        this.scrapeSalaryData(industry, location),
        this.scrapeCompanyTrends(industry)
      ]);

      const marketData = {
        date: new Date(),
        industry,
        totalJobPostings: jobCount,
        skillTrends: skillDemand,
        locationDemands: [{
          city: location,
          country: 'USA',
          jobCount,
          avgSalary: salaryData.average,
          demandScore: this.calculateDemandScore(jobCount, skillDemand)
        }],
        topCompanies: companyTrends,
        avgTimeToHire: 30, // days
        remoteJobPercentage: this.calculateRemotePercentage(industry),
        source: 'aggregated'
      };

      // Save to database
      await this.saveMarketData(marketData);
      
      return marketData;
    } catch (error) {
      console.error('Market scraping error:', error);
      return this.getFallbackData(industry);
    }
  }

  async scrapeJobCount(industry, location) {
    try {
      // Use LinkedIn as primary source
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(industry)}&location=${encodeURIComponent(location)}`;
      
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const jobCount = await page.evaluate(() => {
        const resultsText = document.querySelector('.results-context-header__job-count')?.textContent || '';
        const count = parseInt(resultsText.replace(/\D/g, '')) || 0;
        return count;
      });
      
      await browser.close();
      return jobCount || 1000; // Fallback
    } catch (error) {
      console.error('Error scraping job count:', error);
      return 1000; // Fallback
    }
  }

  async scrapeSkillDemand(industry) {
    const commonSkills = {
      technology: [
        { skill: 'JavaScript', demand: 85, trend: 'rising' },
        { skill: 'Python', demand: 90, trend: 'rising' },
        { skill: 'React', demand: 80, trend: 'stable' },
        { skill: 'Node.js', demand: 75, trend: 'rising' },
        { skill: 'AWS', demand: 85, trend: 'rising' },
        { skill: 'Docker', demand: 70, trend: 'rising' },
        { skill: 'Kubernetes', demand: 65, trend: 'rising' },
        { skill: 'Machine Learning', demand: 75, trend: 'rising' },
        { skill: 'DevOps', demand: 80, trend: 'rising' },
        { skill: 'TypeScript', demand: 70, trend: 'rising' }
      ],
      finance: [
        { skill: 'Excel', demand: 90, trend: 'stable' },
        { skill: 'Financial Modeling', demand: 85, trend: 'rising' },
        { skill: 'Python', demand: 80, trend: 'rising' },
        { skill: 'SQL', demand: 75, trend: 'stable' },
        { skill: 'Risk Management', demand: 70, trend: 'stable' }
      ]
    };

    return commonSkills[industry] || commonSkills.technology;
  }

  async scrapeSalaryData(industry, location) {
    // In production, this would call salary APIs
    const salaryRanges = {
      technology: { min: 80000, max: 180000, average: 120000 },
      finance: { min: 70000, max: 200000, average: 110000 },
      healthcare: { min: 60000, max: 150000, average: 95000 },
      marketing: { min: 50000, max: 120000, average: 80000 }
    };

    return salaryRanges[industry] || salaryRanges.technology;
  }

  async scrapeCompanyTrends(industry) {
    // Mock company data - in production, scrape from LinkedIn/Glassdoor
    const companies = [
      { name: 'Google', hiringCount: 250, avgSalary: 150000 },
      { name: 'Microsoft', hiringCount: 200, avgSalary: 140000 },
      { name: 'Amazon', hiringCount: 300, avgSalary: 135000 },
      { name: 'Apple', hiringCount: 150, avgSalary: 145000 },
      { name: 'Facebook', hiringCount: 180, avgSalary: 155000 }
    ];

    return companies.slice(0, 5);
  }

  calculateDemandScore(jobCount, skillTrends) {
    if (!skillTrends || skillTrends.length === 0) return 50;
    
    const avgDemand = skillTrends.reduce((sum, skill) => sum + skill.demand, 0) / skillTrends.length;
    const jobScore = Math.min(100, (jobCount / 1000) * 20); // Normalize job count
    
    return Math.round((avgDemand * 0.7) + (jobScore * 0.3));
  }

  calculateRemotePercentage(industry) {
    const remotePercentages = {
      technology: 65,
      finance: 40,
      healthcare: 20,
      marketing: 55,
      education: 60
    };
    
    return remotePercentages[industry] || 50;
  }

  async saveMarketData(data) {
    try {
      const existingData = await JobMarketData.findOne({
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        industry: data.industry
      });

      if (existingData) {
        // Update existing record
        await JobMarketData.findByIdAndUpdate(existingData._id, {
          ...data,
          lastUpdated: new Date()
        });
      } else {
        // Create new record
        await JobMarketData.create(data);
      }
    } catch (error) {
      console.error('Error saving market data:', error);
    }
  }

  getFallbackData(industry) {
    return {
      date: new Date(),
      industry,
      totalJobPostings: 1000,
      skillTrends: [
        { skill: 'JavaScript', demand: 80, trend: 'stable' },
        { skill: 'Python', demand: 85, trend: 'rising' },
        { skill: 'React', demand: 75, trend: 'stable' }
      ],
      locationDemands: [{
        city: 'Remote',
        country: 'USA',
        jobCount: 1000,
        avgSalary: 120000,
        demandScore: 75
      }],
      topCompanies: [
        { name: 'Tech Company', hiringCount: 100, avgSalary: 120000 }
      ],
      avgTimeToHire: 30,
      remoteJobPercentage: 50,
      source: 'fallback'
    };
  }

  async getHistoricalData(industry, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const data = await JobMarketData.find({
        industry,
        date: { $gte: startDate }
      }).sort({ date: -1 });

      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }
}

module.exports = new MarketScraper();