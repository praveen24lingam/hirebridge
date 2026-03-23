const express = require('express');
const {
  createJob,
  getPublicJobs,
  getSingleJob
} = require('../controllers/jobController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

router.get('/', getPublicJobs);
router.get('/:jobId', getSingleJob);
router.post('/', authenticate, authorizeRole('employer'), createJob);

module.exports = router;
