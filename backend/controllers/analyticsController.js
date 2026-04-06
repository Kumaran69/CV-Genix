const MarketScraper = require('../services/marketScraper');
const JobMarketData = require('../models/JobMarketData');
const JobMatcher = require('../services/jobMatcher');

class AnalyticsController {
  async getMarketAnalytics(req, res) {
    try {
      const { skills, industry = 'technology', location = 'United States' } = req.body;
      const userId = req.user.id;

      // Get real-time market data
      const marketData = await MarketScraper.scrapeMarketData(industry, location);
      
      // If skills provided, calculate demand for those skills
      let skillDemand = [];
      let demandScore = 50;
      let averageSalary = 120000;

      if (skills && skills.length > 0) {
        const skillAnalysis = await this.analyzeSkillsDemand(skills, marketData);
        skillDemand = skillAnalysis.skillDemand;
        demandScore = skillAnalysis.demandScore;
        averageSalary = skillAnalysis.averageSalary;
      } else {
        // Use overall market data
        skillDemand = marketData.skillTrends.slice(0, 10);
        demandScore = marketData.locationDemands[0]?.demandScore || 50;
        averageSalary = marketData.locationDemands[0]?.avgSalary || 120000;
      }

      // Get historical trends
      const historicalData = await MarketScraper.getHistoricalData(industry, 30);

      // Get trending skills
      const trendingSkills = this.extractTrendingSkills(marketData, historicalData);

      res.json({
        success: true,
        marketData: {
          current: {
            ...marketData,
            skillDemand,
            demandScore,
            averageSalary
          },
          historical: historicalData,
          insights: this.generateInsights(marketData, skillDemand),
          recommendations: this.getRecommendations(demandScore, skillDemand)
        },
        trendingSkills,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting market analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching market analytics',
        error: error.message
      });
    }
  }

  async analyzeSkillsDemand(skills, marketData) {
    const skillDemand = [];
    let totalDemand = 0;
    let totalSalary = 0;
    let count = 0;

    skills.forEach(skill => {
      // Find skill in market data
      const marketSkill = marketData.skillTrends.find(s => 
        s.skill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(s.skill.toLowerCase())
      );

      if (marketSkill) {
        skillDemand.push({
          skill,
          demand: marketSkill.demand,
          trend: marketSkill.trend,
          salaryRange: marketSkill.salaryRange
        });
        totalDemand += marketSkill.demand;
        totalSalary += marketSkill.salaryRange?.average || 120000;
        count++;
      } else {
        // Skill not found in market data, estimate
        skillDemand.push({
          skill,
          demand: 50, // Medium demand
          trend: 'stable',
          salaryRange: { average: 100000 }
        });
        totalDemand += 50;
        totalSalary += 100000;
        count++;
      }
    });

    const demandScore = count > 0 ? Math.round(totalDemand / count) : 50;
    const averageSalary = count > 0 ? Math.round(totalSalary / count) : 120000;

    return {
      skillDemand,
      demandScore,
      averageSalary
    };
  }

  extractTrendingSkills(currentData, historicalData) {
    if (!historicalData || historicalData.length < 2) {
      return currentData.skillTrends.slice(0, 5);
    }

    // Analyze trends over time
    const skillTrends = {};

    historicalData.forEach(dayData => {
      dayData.skillTrends.forEach(skill => {
        if (!skillTrends[skill.skill]) {
          skillTrends[skill.skill] = [];
        }
        skillTrends[skill.skill].push(skill.demand);
      });
    });

    // Calculate which skills are trending up
    const trendingSkills = Object.entries(skillTrends)
      .filter(([_, demands]) => demands.length >= 2)
      .map(([skill, demands]) => {
        const recentDemand = demands[0];
        const previousDemand = demands[1];
        const growth = recentDemand - previousDemand;
        
        return {
          skill,
          demand: recentDemand,
          growth,
          trend: growth > 5 ? 'rising' : growth < -5 ? 'falling' : 'stable'
        };
      })
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 10);

    return trendingSkills;
  }

  generateInsights(marketData, skillDemand) {
    const insights = [];

    // Job count insight
    if (marketData.totalJobPostings > 5000) {
      insights.push({
        type: 'high_demand',
        message: `High job demand with ${marketData.totalJobPostings.toLocaleString()} postings in this industry`,
        severity: 'positive'
      });
    } else if (marketData.totalJobPostings < 1000) {
      insights.push({
        type: 'low_demand',
        message: `Lower job volume with ${marketData.totalJobPostings.toLocaleString()} postings`,
        severity: 'warning'
      });
    }

    // Remote work insight
    if (marketData.remoteJobPercentage > 60) {
      insights.push({
        type: 'remote_opportunity',
        message: `${marketData.remoteJobPercentage}% of jobs offer remote work options`,
        severity: 'positive'
      });
    }

    // Salary insight
    const avgSalary = marketData.locationDemands[0]?.avgSalary;
    if (avgSalary > 130000) {
      insights.push({
        type: 'high_salary',
        message: `Above average salary range: $${avgSalary.toLocaleString()}`,
        severity: 'positive'
      });
    }

    // Skill insights
    const topSkills = skillDemand.slice(0, 3);
    if (topSkills.length > 0) {
      insights.push({
        type: 'top_skills',
        message: `Top in-demand skills: ${topSkills.map(s => s.skill).join(', ')}`,
        severity: 'info'
      });
    }

    // Time to hire insight
    if (marketData.avgTimeToHire < 20) {
      insights.push({
        type: 'fast_hiring',
        message: `Fast hiring process: average ${marketData.avgTimeToHire} days to hire`,
        severity: 'positive'
      });
    }

    return insights;
  }

  getRecommendations(demandScore, skillDemand) {
    const recommendations = [];

    if (demandScore >= 80) {
      recommendations.push({
        type: 'apply_now',
        message: 'Your skills are in high demand. Start applying now!',
        priority: 'high'
      });
    } else if (demandScore >= 60) {
      recommendations.push({
        type: 'improve_skills',
        message: 'Good demand. Consider learning complementary skills.',
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'skill_gap',
        message: 'Lower demand. Focus on learning trending skills.',
        priority: 'high'
      });
    }

    // Add skill-specific recommendations
    const lowDemandSkills = skillDemand.filter(s => s.demand < 40);
    if (lowDemandSkills.length > 0) {
      recommendations.push({
        type: 'replace_skills',
        message: `Consider updating these lower-demand skills: ${lowDemandSkills.map(s => s.skill).join(', ')}`,
        priority: 'medium'
      });
    }

    const highDemandSkills = skillDemand.filter(s => s.demand > 70);
    if (highDemandSkills.length > 0) {
      recommendations.push({
        type: 'highlight_skills',
        message: `Highlight these high-demand skills in your resume: ${highDemandSkills.map(s => s.skill).join(', ')}`,
        priority: 'high'
      });
    }

    return recommendations;
  }

  async getSkillDemand(req, res) {
    try {
      const { skill } = req.params;
      const { location } = req.query;

      const marketData = await MarketScraper.scrapeMarketData('technology', location || 'United States');
      
      const skillData = marketData.skillTrends.find(s => 
        s.skill.toLowerCase() === skill.toLowerCase()
      );

      if (!skillData) {
        return res.status(404).json({
          success: false,
          message: `Skill '${skill}' not found in market data`
        });
      }

      // Get historical data for this skill
      const historicalData = await MarketScraper.getHistoricalData('technology', 90);
      const skillHistory = historicalData.map(data => ({
        date: data.date,
        demand: data.skillTrends.find(s => s.skill === skillData.skill)?.demand || 50
      }));

      res.json({
        success: true,
        skill: skillData,
        history: skillHistory,
        recommendations: this.getSkillSpecificRecommendations(skillData)
      });
    } catch (error) {
      console.error('Error getting skill demand:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching skill demand',
        error: error.message
      });
    }
  }

  getSkillSpecificRecommendations(skillData) {
    const recommendations = [];
    
    if (skillData.trend === 'rising') {
      recommendations.push('This skill is growing in demand. Consider mastering it.');
    } else if (skillData.trend === 'falling') {
      recommendations.push('This skill is declining. Consider learning alternatives.');
    }

    if (skillData.demand > 80) {
      recommendations.push('High demand skill - highlight it prominently in your resume.');
    }

    if (skillData.salaryRange?.average > 120000) {
      recommendations.push(`High salary potential: $${skillData.salaryRange.average.toLocaleString()} average`);
    }

    return recommendations;
  }

  async getSalaryTrends(req, res) {
    try {
      const { location, role } = req.query;

      // In production, this would fetch from salary APIs
      // Mock data for now
      const salaryTrends = {
        location: location || 'United States',
        role: role || 'Software Engineer',
        trends: [
          { year: 2021, average: 110000 },
          { year: 2022, average: 115000 },
          { year: 2023, average: 120000 },
          { year: 2024, average: 125000 }
        ],
        breakdown: {
          junior: 80000,
          mid: 120000,
          senior: 160000,
          lead: 200000
        },
        factors: [
          'Experience level',
          'Location',
          'Company size',
          'Industry'
        ]
      };

      res.json({
        success: true,
        ...salaryTrends
      });
    } catch (error) {
      console.error('Error getting salary trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching salary trends',
        error: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();