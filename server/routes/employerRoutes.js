const express = require('express');
const {
  getEmployerDashboard,
  getEmployerProfile,
  updateEmployerProfile
} = require('../controllers/employerController');
const {
  getEmployerJobs,
  getSingleJobForEmployer,
  closeJob,
  deleteJob
} = require('../controllers/jobController');
const {
  getJobApplicants,
  updateApplicantStatus
} = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/profile', authenticate, authorizeRole('employer'), getEmployerProfile);
router.put('/profile', authenticate, authorizeRole('employer'), updateEmployerProfile);
router.get('/dashboard', authenticate, authorizeRole('employer'), getEmployerDashboard);
router.get('/jobs', authenticate, authorizeRole('employer'), getEmployerJobs);
router.get('/jobs/:jobId/applicants', authenticate, authorizeRole('employer'), getJobApplicants);
router.get('/jobs/:jobId', authenticate, authorizeRole('employer'), getSingleJobForEmployer);
router.patch('/jobs/:jobId/close', authenticate, authorizeRole('employer'), closeJob);
router.delete('/jobs/:jobId', authenticate, authorizeRole('employer'), deleteJob);
router.patch('/applications/:id/status', authenticate, authorizeRole('employer'), updateApplicantStatus);

module.exports = router;
