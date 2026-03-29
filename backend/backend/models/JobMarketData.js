const mongoose = require('mongoose');

const SkillTrendSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    trim: true
  },
  demand: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  trend: {
    type: String,
    enum: ['rising', 'falling', 'stable'],
    default: 'stable'
  },
  salaryRange: {
    min: Number,
    max: Number,
    average: Number
  },
  jobCount: Number,
  companies: [String]
}, { timestamps: true });

const LocationDemandSchema = new mongoose.Schema({
  city: String,
  state: String,
  country: {
    type: String,
    default: 'USA'
  },
  jobCount: Number,
  avgSalary: Number,
  demandScore: Number
});

const JobMarketDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  industry: {
    type: String,
    required: true
  },
  skillTrends: [SkillTrendSchema],
  locationDemands: [LocationDemandSchema],
  topCompanies: [{
    name: String,
    hiringCount: Number,
    avgSalary: Number
  }],
  totalJobPostings: Number,
  avgTimeToHire: Number,
  remoteJobPercentage: Number,
  source: {
    type: String,
    enum: ['linkedin', 'indeed', 'glassdoor', 'github', 'aggregated'],
    default: 'aggregated'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for faster queries
JobMarketDataSchema.index({ date: 1, industry: 1 });
JobMarketDataSchema.index({ 'skillTrends.skill': 1 });

const JobMarketData = mongoose.model('JobMarketData', JobMarketDataSchema);

module.exports = JobMarketData;