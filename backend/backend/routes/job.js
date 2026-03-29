const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get job recommendations based on skills
router.post('/recommendations', jobController.getJobRecommendations);

// Get specific job details
router.get('/:jobId', jobController.getJobDetails);

// Save a job
router.post('/save', jobController.saveJob);

// Get saved jobs
router.get('/saved/list', jobController.getSavedJobs);

// Apply to a job with a resume
router.post('/apply', jobController.applyToJob);

// Get applied jobs history
router.get('/applied/list', jobController.getAppliedJobs);

module.exports = router;